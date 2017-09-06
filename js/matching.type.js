/**

Matching Quiz Type
August 2017

ochang @ Smith & Associates
**/
var Matching = (function() {

    var tabIndex = 1;
    var selectedItem;

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
        checkAnswer: checkAnswer,
        resetAll: resetAll
    };

    function getQuestion(general, data) {
        var question = createElementWithText('p', data.questionText);
        question.classList.add('question');
        return [
            getInstructions(general.showInstruction),
            question
        ];
    }

    function getAnswer(general, data, buttons) {
        selectedItem = undefined;
        var resetAllButton = createElementWithText('button', 'Reset All');
        resetAllButton.classList.add('reset');
        resetAllButton.setAttribute('onclick', 'resetAll()');
        var actionContainer = getActionContainer(buttons, 'answer-actions');
        actionContainer.insertBefore(resetAllButton, actionContainer.firstChild);
        return [
            getQuestionNodes(data.QuestionNodes),
            getAnswerNodes(data.AnswerNodes),
            actionContainer
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

            // Create feedback container
            var container = document.createElement('div');
            container.classList.add('feedback-container', 'matching');

            // Create feedback title
            var title = createElementWithText('h4', r.title);

            // Create list for feedbacks
            var ul = document.createElement('ul');
            ul.classList.add('feedback-list');

            r.lis.forEach(li => {

                // Each feedback will produce two items
                // header and feedback

                // Create feedback header
                var resultClass = ['feedback-item', li.isCorrect? 'correct' : 'wrong'];
                var liHeader;
                if (li.type == 'image') {
                    liHeader = createImageElement('li', li);
                } else {
                    liHeader = createElementWithText('li', li.question);
                }
                liHeader.classList.add(...resultClass);

                // Add correct answer to header if is incorrect
                if (!li.isCorrect && li.correctAnswer) {
                    var span = createElementWithText('span', '('+li.correctAnswer+')');
                    liHeader.appendChild(span);
                }

                // Create and add result icon to header
                var icon = getResultIcon(li.isCorrect);
                liHeader.appendChild(icon);

                // Create feedback
                var liText;
                if (li.feedback.indexOf('</') > -1) {
                    liText = document.createElement('li');
                    liText.classList.add('custom');
                    var fb = createElementWithText('b', 'Feedback: ');
                    liText.innerHTML = li.feedback;
                    liText.insertBefore(fb, liText.firstChild);
                } else {
                    liText = createElementWithText('li', 'Feedback: ' + li.feedback);
                }

                // Add header and feedback to list
                ul.appendChild(liHeader);
                ul.appendChild(liText);
            });

            // Add feedback title and feedback list to container
            container.appendChild(title);
            container.appendChild(ul);

            // return feedback container
            return container;
        });

        // return list of feedback container
        return feedbacks;
    }

    function getInstructions(show=true) {
        if (show) {
            var p = createElementWithText('p', INST);
            p.classList.add('instructions');
        }
        return null;
    }

    function createElementWithText(tag, text) {
        var el = document.createElement(tag);
        var text = document.createTextNode(text);
        el.appendChild(text);
        return el;
    }

    function createImageElement(tag, node) {
        var el = document.createElement(tag);
        var img = document.createElement('img');
        img.setAttribute('alt', node.alt);
        img.setAttribute('src', node.src);
        el.appendChild(img);
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
        el.classList.add('material-icons');
        if (isCorrect) {
            el.appendChild(document.createTextNode('check'));
        } else {
            el.appendChild(document.createTextNode('clear'));
        }
        return el;
    }

    function getAnswerNodes(data) {

        // Create container for answer dropzones
        var container = document.createElement('div');
        container.classList.add('answer-nodes-container');
        // {
        //     "key": "ppv",
        //     "title": "Purchase Price Variance (PPV)",
        //     "color": "default",
        //     "src" : "none"
        // }
        data.forEach(answerNode => {
            var node = document.createElement('div');
            var title = createElementWithText('h4', answerNode.title);
            var ul = document.createElement('ul');
            ul.classList.add('dropzone');
            ul.setAttribute('id', answerNode.key);
            var icon = getEmptyDropzoneIcon();
            node.classList.add('answer-nodes', 'empty');
            node.appendChild(title);
            node.appendChild(ul);
            node.appendChild(icon);
            node.setAttribute('ondragover', 'Matching.onDragOver(event)');
            node.setAttribute('ondrop', 'Matching.onDrop(event)');
            node.setAttribute('tabIndex', tabIndex++);
            node.addEventListener('focus', focus);
            node.addEventListener('blur', blur);
            node.addEventListener('mouseleave', blur);
            node.addEventListener('keyup', dropItem);
            container.appendChild(node);
        });
        return container;
    }

    function focus(e) {
        e.target.classList.add('shadow');
    }

    function blur(e) {
        e.target.classList.remove('shadow');
    }

    function selectItem(e) {
        if (this != e.target || e.defaultPrevented) {
            return;
        }
        if (e.key === 'Enter') {
            if (selectedItem) {
                if (selectedItem != e.target) {
                    selectedItem.classList.remove('selected');
                }
            }
            selectedItem = e.target;
            selectedItem.classList.add('selected');
        }
    }

    function dropItem(e) {
        if (this != e.target || e.defaultPrevented) {
            return;
        }
        if (e.key === 'Enter' && selectedItem) {
            selectedItem.classList.remove('selected');
            e.target.classList.remove('empty');
            var selectedParent = selectedItem.parentNode.parentNode;
            e.target.querySelector('.dropzone')
                .appendChild(selectedItem);
            if (selectedParent.querySelector('.dropzone').children.length === 0) {
                selectedParent.classList.add('empty');
            }
            selectedItem = undefined;
        }
    }

    function getQuestionNodes(data) {
        var container = document.createElement('div');
        container.classList.add('question-nodes-container');
        var ul = document.createElement('ul');
        ul.classList.add('dropzone');
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
            var li;
            if (questionNode.type == 'image') {
                li = createImageElement('li', questionNode);
            } else {
                li = createElementWithText('li', questionNode.question);
            }
            li.classList.add('questionNode');
            li.setAttribute('id', idx);
            li.setAttribute('draggable', 'true');
            li.setAttribute('ondragstart', 'Matching.onDragStart(event)');
            li.setAttribute('tabIndex', tabIndex++);
            li.addEventListener('mouseleave', blur);
            li.addEventListener('keyup', selectItem);
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

    function getActionContainer(buttons=[], className='') {
        var el = document.createElement('div');
        el.classList.add(className);

        buttons.forEach(button => {
            var buttonEl = createElementWithText('button', button.label);
            buttonEl.classList.add(button.className);
            buttonEl.setAttribute('onclick', button.onclick);
            el.appendChild(buttonEl);
        });
        return el;
    }

    function resetAll() {
        selectedItem = undefined;

        // get all question items(draggable items)
        var lis = document.querySelectorAll('div.content li');

        // remove empty class from question container
        document.querySelector('.question-nodes-container').classList.remove('empty');

        // get question list
        var questionNode = document.querySelector('.question-nodes-container ul.dropzone');

        // add all question items to question list
        [...lis].forEach(li => questionNode.appendChild(li));

        // get all answer containers
        var answerContainers = document.querySelectorAll('div.answer-nodes');

        // add empty class to answer containers
        [...answerContainers].forEach(div => div.classList.add('empty'));
    }

    function checkAnswer(data) {
        // Get all question nodes
        var all = data.QuestionNodes;

        // Generate answer legend
        var answerLegend = {};
        data.AnswerNodes.forEach(a => {
            answerLegend[a.key] = {
                title: a.title,
                answers: all.filter(b => {
                    return b.answer == a.key;
                })
            };
        });

        // Keeping track of score and overall correctness
        var score = 0;
        var isCorrect;

        // Map all list item in answer dropzones and validate answer
        var result = [...document.querySelectorAll('.answer-nodes .dropzone')]
            .map(ul => {

                // Get answer node key
                var key = ul.id;

                // Get answer node title
                var title = ul.previousSibling.innerHTML;

                // Map all default question values with validation and feedbacks
                var lis = [...ul.children].map(li => {

                    // Get default question values
                    var temp = all[li.id];

                    // Validate answer
                    temp.isCorrect = temp.answer == key;

                    // Update overall correctness
                    isCorrect = isCorrect === undefined? temp.isCorrect : isCorrect && temp.isCorrect;


                    if (temp.isCorrect) {
                        // Add correct feedback if is correct
                        temp.feedback = temp.correct;

                        // Update score
                        score += temp.scoreValue || 0;

                    } else {
                        // Add wrong feedback is is incorrect
                        // Add correct answer if provided
                        temp.feedback = temp.wrong;
                        if (temp.answer) {
                            temp.correctAnswer = answerLegend[temp.answer].title;
                        }
                    }

                    // return default question values with
                    // feddback, isCorrect, correctAnswer
                    return temp;
                });

                // return item key, title, correctness, question values with feedback
                return {
                    key: key,
                    title: title,
                    lis: lis,

                    // Get this answer list correctness only
                    isCorrect: lis.reduce((acc, cur) => {
                        return acc && cur.isCorrect
                    }, lis.length == answerLegend[key].answers.length)
                }
            });

        // If overall correctness is correct give max score
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
    }

    function onDragOver(ev) {
        ev.preventDefault();
    }

})();
