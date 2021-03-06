/**

Multiple Choice Quiz Type
August 2017

ochang @ Smith & Associates
**/
var MultipleChoice = (function () {
    'use strict';
    /*jslint browser: true */

    function getAnswer(data) {
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
                a.elId = 'radioButton' + idx;
                a.elValue = idx;
                return a;
            });
        answers = answers.sort(function () {
            return 0.5 - Math.random();
        });
        answers.forEach(function (a) {
            var el = document.createElement('input'),
                label = document.createElement('label');
            el.setAttribute('type', 'radio');
            el.setAttribute('id', a.elId);
            el.setAttribute('value', a.elValue);
            el.setAttribute('name', 'selectedAnswer');
            label.appendChild(document.createTextNode(a.answerText));
            label.classList.add('radio-label');
            label.setAttribute('for', a.elId);
            div.appendChild(el);
            div.appendChild(label);
        });
        div.classList.add('answer-container');
        return [div];
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

    function getFeedback(result) {
        var correctAnswer = getResult(result, 'c'),
            selectedAnswer = getResult(result, 's'),
            feedback = getResult(result, 'f');
        return [
            correctAnswer,
            selectedAnswer,
            feedback
        ];
    }


    return {
        getAnswer: getAnswer,
        checkAnswer: checkAnswer,
        getFeedback: getFeedback
    };

}());
