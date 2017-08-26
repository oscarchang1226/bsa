/**

Matching Quiz Type
August 2017

ochang @ Smith & Associates
**/
var Matching = (function() {

    var INST = `
        Match each item to the appropriate category. For keyboard only users,
        use the tab key to select an answer from the list and use the enter key to select it.
        Use tab again to select the correct dropzone and then hit the enter key to confirm your answer.
        Select an answer and hit the delete key to return it to its original position.
        Use the "Check Answers" button to get your results.
    `;

    return {
        prepareQuestion: prepareQuestion,
        prepareAnswer: prepareAnswer,
        prepareFeedback: prepareFeedback,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onDragOver: onDragOver,
        getValidationProvider: getValidationProvider,
        checkAnswer: checkAnswer
    };

    function prepareQuestion(general, data) {
        return [
            prepareInstructions(general.showInstruction),
            createElement('p', data.questionText, 'question')
        ];
    }

    function prepareAnswer(general, data, buttonCallBacks) {
        return [
            prepareQuestionNodes(data.QuestionNodes),
            prepareAnswerNodes(data.AnswerNodes),
            prepareAnswerActions(buttonCallBacks)
        ]
    }

    function prepareFeedback(general, data) {

    }

    function prepareInstructions(show=true) {
        if (show) {
            return createElement('p', INST, {
                className: 'instructions'
            });
        }
        return null;
    }

    function createElement(tag, text, options=null) {
        var el = document.createElement(tag);
        if (text) {
            var text = document.createTextNode(text);
            el.appendChild(text);
        }
        if (options && typeof(options) === 'object') {
            Object.keys(options).forEach(o => {
                el[o] = options[o];
            });
        }
        return el;
    }

    function prepareAnswerNodes(data) {
        var container = createElement('div', null, {className: 'answer-nodes-container'});
        // {
        //     "key": "ppv",
        //     "title": "Purchase Price Variance (PPV)",
        //     "color": "default",
        //     "src" : "none"
        // }
        data.forEach(answerNode => {
            var node = createElement('div', null, {className: 'answer-nodes'});
            var title = createElement('h4', answerNode.title);
            var ul = createElement('ul', null, {
                className: 'dropzone',
                id: answerNode.key
            });
            node.appendChild(title);
            node.appendChild(ul);
            node.setAttribute('ondragover', 'Matching.onDragOver(event)');
            node.setAttribute('ondrop', 'Matching.onDrop(event)');
            container.appendChild(node);
        });
        return container;
    }

    function prepareQuestionNodes(data) {
        var container = createElement('ul', null, {className: 'question-nodes-container dropzone'});
        // {
        //     "question" : "The exact cost or price paid under contract for components.",
        //     "answer" : "price",
        //     "type" : "text",
        //     "color": "default",
        //     "correct" : "",
        //     "wrong" : ""
        // }
        data.forEach((questionNode, idx) => {
            var li = createElement('li', questionNode.question, {
                className: 'questionNode',
                id: idx
            });
            li.setAttribute('draggable', 'true');
            li.setAttribute('ondragstart', 'Matching.onDragStart(event)');
            container.appendChild(li);
        });
        container.setAttribute('ondragover', 'Matching.onDragOver(event)');
        container.setAttribute('ondrop', 'Matching.onDrop(event)');
        return container;
    }

    function prepareAnswerActions(callbacks) {
        var el = createElement('div', null, {className: 'answer-actions'});
        var button = createElement('button', 'Check Answer');
        button.setAttribute('onclick', callbacks.next);
        el.appendChild(button);
        return el;
    }

    function getValidationProvider(data) {
        var expected = null;
        if (data.QuestionNodes) {
            expected = {};
            data.QuestionNodes.forEach((questionNode, idx) => {
                if(questionNode.answer) {
                    questionNode.id = idx;
                    if(expected[questionNode.answer]) {
                        expected[questionNode.answer].push(questionNode);
                    } else {
                        expected[questionNode.answer] = [questionNode];
                    }
                }
            });
        }
        return expected;
    }

    function checkAnswer(expected) {
        var result = {};
        Object.keys(expected).forEach(k => {
            var ul = document.getElementById(k);
            var lis = [...ul.querySelectorAll('li').values()].map(li => {
                return li.id;
            });
            // result.userAnwsers = result.userAnswers || [];
            // result.userAnswers.push({
            //     answer: lis
            // });
            // result.expectedAnswers = result.expectedAnswers || [];
            // result.expectedAnswers.push({
            //     answers: expected[k].map()
            // });
        });

    }

    function onDragStart(ev) {
        ev.dataTransfer.setData('nodeId', ev.currentTarget.id);
    }

    function onDrop(ev) {
        ev.preventDefault();
        var nodeId = ev.dataTransfer.getData('nodeId');
        var node = document.getElementById(nodeId);
        var dropzone = ev.currentTarget;
        if (dropzone.querySelector('ul.dropzone')) {
            dropzone = dropzone.querySelector('ul.dropzone');
        }

        if (ev.currentTarget.querySelector('ul.dropzone')) {
            ev.currentTarget.querySelector('ul.dropzone').appendChild(node);
        } else {
            ev.currentTarget.appendChild(node);
        }
    }

    function onDragOver(ev) {
        ev.preventDefault();
    }

})();
