/**

Matching Quiz Type
August 2017

ochang @ Smith & Associates
**/
var Matching = (function () {
    'use strict';
    /*jslint browser:true */
    var tabIndex = 1,
        selectedItem,
        INST = 'Match each item to the appropriate category. For keyboard only users,' +
            ' use the tab key to select an answer from the list and use the enter key to select it.' +
            ' Use tab again to select the correct dropzone and then hit the enter key to confirm your answer.' +
            ' Select an answer and hit the delete key to return it to its original position.' +
            ' Use the "Check Answers" button to get your results.';

    function createElementWithText(tag, text) {
        var el = document.createElement(tag);
        el.appendChild(document.createTextNode(text));
        return el;
    }

    function focus(e) {
        e.target.classList.add('shadow');
    }

    function blur(e) {
        e.target.classList.remove('shadow');
    }

    function selectItem(e) {
        if (this !== e.target || e.defaultPrevented) {
            return;
        }
        if (e.key === 'Enter') {
            if (selectedItem) {
                if (selectedItem !== e.target) {
                    selectedItem.classList.remove('selected');
                }
            }
            selectedItem = e.target;
            selectedItem.classList.add('selected');
        }
    }

    function dropItem(e) {
        if (this !== e.target || e.defaultPrevented) {
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

    function onDragStart(ev) {
        ev.dataTransfer.setData('nodeId', ev.currentTarget.id);
    }

    function onDrop(ev) {
        ev.preventDefault();
        var nodeId = ev.dataTransfer.getData('nodeId'),
            node = document.getElementById(nodeId),
            previousParent = node.parentNode,
            previousContainer = previousParent.parentNode,
            dropzone = ev.currentTarget;
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

    function onTouchMove(ev) {
        var el = ev.target,
            touch = ev.targetTouches[0],
            main = document.querySelector('main'),
            previousParent = el.parentNode,
            endTarget,
            temp;
        if (el.tagName.toUpperCase() === 'IMG') {
            el = el.parentNode;
            previousParent = el.parentNode;
        }

        if (!el.classList.contains('questionNode')) {
            return;
        }


        function scrollTimer(speed) {
            if (main.scrollHeight > main.offsetHeight &&
                    main.scrollTop + speed < main.offsetHeight
                    ) {
                main.scrollTop += speed;
            } else if (document.body.scrollTop + speed < document.body.offsetHeight) {
                document.body.scrollTop += speed;
            }
        }

        // Make the element draggable by giving it an absolute position and modifying the x and y coordinates
        el.classList.add('fixed', 'shadow');
        if (previousParent.querySelectorAll('li:not(.fixed)').length === 0) {
            previousParent.parentNode.classList.add('empty');
        }

        el.style.left = (touch.pageX - (el.offsetWidth / 2)) + 'px';
        el.style.top = (touch.pageY - (el.offsetHeight / 2) - document.body.scrollTop) + 'px';

        if (touch.pageY < main.offsetTop) {
            setInterval(scrollTimer(-10), 50);
        } else if (touch.pageY > (main.offsetHeight + main.offsetTop)) {
            setInterval(scrollTimer(10), 50);
        }

        el.addEventListener('touchend', function (e) {

            el.classList.remove('fixed', 'shadow');
            el.removeAttribute('style');

            endTarget = document.elementFromPoint(
                e.changedTouches[0].pageX - (document.body.scrollLeft + main.scrollLeft),
                e.changedTouches[0].pageY - (document.body.scrollTop + main.scrollTop)
            );

            temp = true;
            while (temp && endTarget && endTarget.classList) {
                if (endTarget.classList.contains('answer-nodes') ||
                        endTarget.classList.contains('question-nodes-container')
                        ) {
                    temp = false;
                } else if (endTarget.parentNode !== main) {
                    endTarget = endTarget.parentNode;
                } else {
                    endTarget = null;
                    temp = false;
                }
            }

            if (endTarget) {
                endTarget = endTarget.querySelector('.dropzone');
                if (endTarget !== previousParent) {
                    endTarget.appendChild(el);
                }
                if (previousParent.children.length === 0) {
                    previousParent.parentNode.classList.add('empty');
                }
                endTarget.parentNode.classList.remove('empty');
            }

        });
    }

    function getInstructions(show) {
        if (show === undefined) {
            show = true;
        }
        if (show) {
            var p = createElementWithText('p', INST);
            p.classList.add('instructions');
            return p;
        }
        return null;
    }

    function createImageElement(tag, node) {
        var el = document.createElement(tag),
            img = document.createElement('img');
        img.setAttribute('alt', node.alt);
        img.setAttribute('src', node.src);
        el.appendChild(img);
        el.classList.add('media');
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

    function getQuestionNodes(data) {
        var container = document.createElement('div'),
            ul = document.createElement('ul'),
            emptyIcon = getEmptyDropzoneIcon();

        container.classList.add('question-nodes-container');
        ul.classList.add('dropzone');
        // {
        //     "question" : "The exact cost or price paid under contract for components.",
        //     "answer" : "price",
        //     "type" : "text",
        //     "color": "default",
        //     "correct" : "",
        //     "wrong" : ""
        // }
        data.forEach(function (questionNode, idx) {
            var li;
            if (questionNode.type === 'image') {
                li = createImageElement('li', questionNode);
            } else {
                li = createElementWithText('li', questionNode.question);
            }
            li.classList.add('questionNode');
            li.setAttribute('id', idx);
            li.setAttribute('draggable', 'true');
            li.setAttribute('ondragstart', 'Matching.onDragStart(event)');
            li.setAttribute('ontouchmove', 'onTouchMove(event)');
            li.setAttribute('tabIndex', tabIndex);
            tabIndex += 1;
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
        data.forEach(function (answerNode) {
            var node = document.createElement('div'),
                title = createElementWithText('h4', answerNode.title),
                ul = document.createElement('ul'),
                icon = getEmptyDropzoneIcon();
            ul.classList.add('dropzone');
            ul.setAttribute('id', answerNode.key);
            node.classList.add('answer-nodes', 'empty');
            node.appendChild(title);
            node.appendChild(ul);
            node.appendChild(icon);
            node.setAttribute('ondragover', 'Matching.onDragOver(event)');
            node.setAttribute('ondrop', 'Matching.onDrop(event)');
            node.setAttribute('tabIndex', tabIndex);
            tabIndex += 1;
            node.addEventListener('focus', focus);
            node.addEventListener('blur', blur);
            node.addEventListener('mouseleave', blur);
            node.addEventListener('keyup', dropItem);
            container.appendChild(node);
        });
        return container;
    }

    function getQuestion(data, general) {
        var question = createElementWithText('p', data.questionText);
        question.classList.add('question');
        return [
            getInstructions(general.showInstruction),
            question
        ];
    }

    function getAnswer(data) {
        selectedItem = undefined;
        return [
            getQuestionNodes(data.QuestionNodes),
            getAnswerNodes(data.AnswerNodes)
        ];
    }

    function getFeedbackElements(result) {
        var feedbacks = result.map(function (r) {

            // Create feedback container
            var container = document.createElement('div'),
            // Create feedback title
                title = createElementWithText('h4', r.title),
            // Create list for feedbacks
                ul = document.createElement('ul');

            container.classList.add('feedback-container', 'matching');

            ul.classList.add('feedback-list');

            r.lis.forEach(function (li) {

                // Each feedback will produce two items
                // header and feedback

                // Create feedback header
                var resultClass = ['feedback-item', li.isCorrect ? 'correct' : 'wrong'],
                    liHeader,
                    liText;
                if (li.type === 'image') {
                    liHeader = createImageElement('li', li);
                } else {
                    liHeader = createElementWithText('li', li.question);
                }
                resultClass.forEach(function (rc) {
                    liHeader.classList.add(rc);
                });

                // Add correct answer to header if is incorrect
                if (!li.isCorrect && li.correctAnswer) {
                    liHeader.appendChild(
                        createElementWithText('span', '(' + li.correctAnswer + ')')
                    );
                }

                // Create and add result icon to header
                liHeader.appendChild(getResultIcon(li.isCorrect));

                // Create feedback
                if (li.feedback.indexOf('</') > -1) {
                    liText = document.createElement('li');
                    liText.classList.add('custom');
                    liText.innerHTML = li.feedback;
                    liText.insertBefore(
                        createElementWithText('b', 'Feedback: '),
                        liText.firstChild
                    );
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

    function getFeedback(result) {
        var feedbacks = getFeedbackElements(result.result);
        return feedbacks;
    }

    function resetAll() {
        selectedItem = undefined;

        // get all question items(draggable items)
        var lis = document.querySelectorAll('div.content li'),
        // get question list
            questionNode = document.querySelector('.question-nodes-container ul.dropzone'),
        // get all answer containers
            answerContainers = document.querySelectorAll('div.answer-nodes'),
            li,
            div;

        // remove empty class from question container
        document.querySelector('.question-nodes-container').classList.remove('empty');

        // add all question items to question list
        for (li = 0; li < lis.length; li += 1) {
            questionNode.appendChild(lis[li]);
        }

        // add empty class to answer containers
        for (div = 0; div < answerContainers.length; div += 1) {
            answerContainers[div].classList.add('empty');
        }
    }

    function checkAnswer(data) {
        // Get all question nodes
        var all = data.QuestionNodes,
            answerLegend = {},
        // Keeping track of score and overall correctness
            score = 0,
            result = [];

        // Generate answer legend
        data.AnswerNodes.forEach(function (a) {
            answerLegend[a.key] = {
                title: a.title,
                answers: all.filter(function (b) {
                    return b.answer === a.key;
                })
            };
        });

        document.querySelectorAll('.answer-nodes .dropzone').forEach(function (ul) {
            result.push({
                key: ul.id,
                title: ul.previousSibling.innerHTML,
                lis: []
            });
        });

        document.querySelectorAll('.dropzone li').forEach(function (li) {
            var q = data.QuestionNodes[li.id],
                p = li.parentElement,
                r = (p.id || false) === (q.answer || false),
                temp;
            q.feedback = r ? q.correct : q.wrong;
            q.isCorrect = r;
            if (!r) {
                if (q.answer) {
                    q.correctAnswer = answerLegend[q.answer].title;
                }
            } else {
                score += q.scoreValue;
            }
            temp = result.filter(function (re) {
                return re.key === p.id;
            });
            if (temp.length === 1) {
                temp[0].lis.push(q);
                if (temp[0].isCorrect === undefined) {
                    temp[0].isCorrect = r;
                } else {
                    temp[0].isCorrect = temp[0].isCorrect && r;
                }
            }
        });

        return {
            result: result,
            score: score,
            maxScore: data.maxScoreValue
        };
    }

    return {
        getQuestion: getQuestion,
        getAnswer: getAnswer,
        getFeedback: getFeedback,
        onDragStart: onDragStart,
        onDrop: onDrop,
        onDragOver: onDragOver,
        onTouchMove: onTouchMove,
        checkAnswer: checkAnswer,
        resetAll: resetAll
    };

}());
