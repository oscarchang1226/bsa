/**

Matching Quiz Type
August 2017

ochang @ Smith & Associates
**/
var Matching = (function() {

    // TODO: Implement tab functionality

    var INST = `
        Match each item to the appropriate category. For keyboard only users,
        use the tab key to select an answer from the list and use the enter key to select it.
        Use tab again to select the correct dropzone and then hit the enter key to confirm your answer.
        Select an answer and hit the delete key to return it to its original position.
        Use the "Check Answers" button to get your results.
    `;

    return {
        getQuestion: getQuestion,
        getAnswer: getAnswer,
        getFeedback: getFeedback,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onDragOver: onDragOver,
        checkAnswer: checkAnswer
    };

    function getQuestion(general, data) {
        return [
            getInstructions(general.showInstruction),
            createElement('p', data.questionText, 'question')
        ];
    }

    function getAnswer(general, data, buttons) {
        return [
            getQuestionNodes(data.QuestionNodes),
            getAnswerNodes(data.AnswerNodes),
            getActionContainer(buttons, 'answer-actions')
        ]
    }

    function getFeedback(general, result, buttons) {
        var feedbacks = getFeedbackElements(result.result);
        return [
            ...feedbacks,
            getActionContainer(
                 buttons,
                 'feedback-actions'
             )
         ];
    }

    function getFeedbackElements(result) {
        var feedbacks = result.map(r => {
            var container = createElement(
                'div',
                null,
                {
                    className: getFeedbackClassName(
                        'feedback-container',
                        r.isCorrect
                    )
                }
            );
            var title = createElement('h4', r.title);
            var ul = createElement(
                'ul',
                null,
                {
                    className: 'feedback-list'
                }
            );
            r.lis.forEach(li => {
                var liHeader = createElement(
                    'li',
                    li.question,
                    {
                        className: getFeedbackClassName(
                            'feedback-item',
                            li.isCorrect
                        )
                    }
                );
                if (!li.isCorrect && li.correctAnswer) {
                    liHeader.appendChild(
                        createElement(
                            'span',
                            '('+li.correctAnswer+')'
                        )
                    )
                }
                var liText = createElement(
                    'li',
                    'Feedback: ' + li.feedback
                );
                ul.appendChild(liHeader);
                ul.appendChild(liText);
            });
            container.appendChild(title);
            container.appendChild(ul);
            return container;
        });
        return feedbacks;
    }

    function getFeedbackClassName(c, r) {
        if (r) {
            return c + ' correct';
        } else {
            return c + ' wrong';
        }
    }

    function getInstructions(show=true) {
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

    function getEmptyDropzoneIcon() {
        var i = document.createElement('i');
        i.appendChild(document.createTextNode('add'));
        i.classList.add('material-icons');
        return i;
    }

    function getResultIcon(isCorrect) {
        var el = document.createElement('i');
        el.classList.add('material-icons', isCorrect? 'correct' : 'wrong');
        if (isCorrect) {
            el.appendChild(document.createTextNode('check'));
        } else {
            el.appendChild(document.createTextNode('clear'));
        }
        return el;
    }

    function getAnswerNodes(data) {
        var container = createElement('div', null, {className: 'answer-nodes-container'});
        // {
        //     "key": "ppv",
        //     "title": "Purchase Price Variance (PPV)",
        //     "color": "default",
        //     "src" : "none"
        // }
        data.forEach(answerNode => {
            var node = createElement('div', null, {className: 'answer-nodes empty'});
            var title = createElement('h4', answerNode.title);
            var ul = createElement('ul', null, {
                className: 'dropzone',
                id: answerNode.key
            });
            var icon = getEmptyDropzoneIcon();
            node.appendChild(title);
            node.appendChild(ul);
            node.appendChild(icon);
            node.setAttribute('ondragover', 'Matching.onDragOver(event)');
            node.setAttribute('ondrop', 'Matching.onDrop(event)');
            container.appendChild(node);
        });
        return container;
    }

    function getQuestionNodes(data) {
        var container = createElement('div', null, {className: 'question-nodes-container'});
        var ul = createElement('ul', null, {className: 'dropzone'});
        var emptyIcon = getEmptyDropzoneIcon();
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
            ul.appendChild(li);
        });
        if (ul.children.length === 0) {
            container.classList.add('empty');
        }
        container.setAttribute('ondragover', 'Matching.onDragOver(event)');
        container.setAttribute('ondrop', 'Matching.onDrop(event)');
        container.appendChild(ul);
        container.appendChild(emptyIcon);
        return container;
    }

    function getActionContainer(buttons, className) {
        var el = createElement('div', null, {className: className});
        buttons.forEach(button => {
            var buttonEl = createElement('button', button.label, {className: button.className});
            buttonEl.setAttribute('onclick', button.onclick);
            el.appendChild(buttonEl);
        });
        return el;
    }

    function checkAnswer(data) {
        // TODO: Imporve validation
        var all = data.QuestionNodes;
        var answerLegend = {};
        data.AnswerNodes.forEach(a => {
            answerLegend[a.key] = {
                title: a.title,
                answers: all.filter(b => {
                    return b.answer == a.key;
                })
            };
        });
        var score = 0;
        var isCorrect = true;
        var result = [...document.querySelectorAll('.answer-nodes .dropzone')]
            .map(ul => {
                var key = ul.id;
                var title = ul.previousSibling.innerHTML;
                var lis = [...ul.querySelectorAll('li')].map(li => {
                    var temp = all[li.id];
                    temp.isCorrect = temp.answer == key;
                    isCorrect = isCorrect && temp.isCorrect;
                    if (temp.isCorrect) {
                        temp.feedback = temp.correct;
                    } else {
                        temp.feedback = temp.wrong;
                        if (temp.answer) {
                            temp.correctAnswer = answerLegend[temp.answer].title;
                        }
                        score += temp.scoreValue || 0;
                    }
                    return temp;
                });
                return {
                    key: key,
                    title: title,
                    lis: lis,
                    isCorrect: lis.reduce((acc, cur) => {
                        return acc && cur.isCorrect
                    }, lis.length == answerLegend[key].answers.length)
                }
            });
        // score = Math.round(score);
        if (isCorrect) {
            score = data.maxScoreValue;
        }
        return {
            result: result,
            score: score,
            maxScore: data.maxScoreValue
        };
    }

    function onDragStart(ev) {
        ev.dataTransfer.setData('nodeId', ev.currentTarget.id);
    }

    function onDrop(ev) {
        ev.preventDefault();
        var nodeId = ev.dataTransfer.getData('nodeId');
        var node = document.getElementById(nodeId);
        var previousParent = node.parentNode;
        var previousContainer = previousParent.parentNode;
        var dropzone = ev.currentTarget;
        if (dropzone.querySelector('ul.dropzone')) {
            dropzone = dropzone.querySelector('ul.dropzone');
        }
        dropzone.parentNode.classList.remove('empty');
        dropzone.appendChild(node);
        if (previousParent.children.length === 0) {
            previousContainer.classList.add('empty');
        }
        // if (ev.currentTarget.querySelector('ul.dropzone')) {
        //     ev.currentTarget.querySelector('ul.dropzone').appendChild(node);
        // } else {
        //     ev.currentTarget.appendChild(node);
        // }
    }

    function onDragOver(ev) {
        ev.preventDefault();
    }

})();
