/**

Multiple Choice Quiz Type
August 2017

ochang @ Smith & Associates
**/
var MultipleChoice = (function () {
    'use strict';
    /*jslint browser: true */

    function getActionContainer(buttons, className) {
        var el = document.createElement('div');
        el.classList.add(className);
        buttons.forEach(function (button) {
            var buttonEl = document.createElement('button');
            buttonEl.appendChild(document.createTextNode(button.label));
            buttonEl.classList.add(button.className);
            buttonEl.setAttribute('onclick', button.onclick);
            el.appendChild(buttonEl);
        });
        return el;
    }

    function getAnswer(buttons, data) {
        /**
        answers: [
        {
          "answerText": "Jean-Louise Finch",
          "feedBack": "Correct!",
          "scoreValue": 1
        },
        ...]
        **/
        var div = document.createElement('div'),
            answers = data.answers.map(function (a, idx) {
                var elId = 'radioButton' + idx,
                    el = document.createElement('input'),
                    label = document.createElement('label');
                el.setAttribute('type', 'radio');
                el.setAttribute('id', elId);
                el.setAttribute('value', idx);
                el.setAttribute('name', 'selectedAnswer');
                label.appendChild(document.createTextNode(a.answerText));
                label.classList.add('radio-label');
                label.setAttribute('for', elId);
                div.appendChild(el);
                div.appendChild(label);
                return div;
            });
        div.classList.add('answer-container');
        answers.push(getActionContainer(buttons, 'answer-actions'));
        return answers;
    }

    function checkAnswer(data) {
        /*jslint unparam: true*/
        var score = 0,
            maxScore = data.maxScoreValue,
            temp = data.answers.map(function (a, idx) {
                a.id = idx;
                return a;
            }),
            correctAnswer = temp.find(function (a) {
                return a.scoreValue > 0;
            }),
            selected = temp.find(function (ignore, idx) {
                var el = document.getElementById('radioButton' + idx);
                return el.checked;
            });
        /*jslint unparam: false*/
        if (selected) {
            selected.isCorrect = correctAnswer.id === selected.id;
        } else {
            selected = {
                isCorrect: false,
                answerText: ''
            };
        }
        return {
            score: selected.isCorrect ? maxScore : score,
            maxScore: maxScore,
            correctAnswer: correctAnswer.answerText,
            selected: selected.answerText,
            result: selected
        };
    }

    function getResultAttributes(result, type) {
        if (type === 'c') {
            result = {
                className: 'feedback-correct-answer',
                boldText: 'Correct Answer: ',
                value: result.correctAnswer
            };
        } else if (type === 's') {
            result = {
                className: 'feedback-selected-answer',
                boldText: 'You selected: ',
                value: result.selected
            };
        } else if (type === 'f') {
            result = {
                className: 'feedback-item',
                boldText: 'Feedback: ',
                value: result.result.feedBack || ''
            };
        }
        return result;
    }

    function getResult(result, type) {
        var attr = getResultAttributes(result, type),
            el = document.createElement('p'),
            bold = document.createElement('b'),
            text = document.createTextNode(attr.value);

        el.classList.add(attr.className);
        bold.appendChild(document.createTextNode(attr.boldText));
        el.appendChild(bold);
        el.appendChild(text);
        return el;
    }

    function getFeedback(result, buttons) {
        var correctAnswer = getResult(result, 'c'),
            selectedAnswer = getResult(result, 's'),
            feedback = getResult(result, 'f');
        return [
            correctAnswer,
            selectedAnswer,
            feedback,
            getActionContainer(
                buttons,
                'feedback-actions'
            )
        ];
    }


    return {
        getAnswer: getAnswer,
        checkAnswer: checkAnswer,
        getFeedback: getFeedback
    };

}());
