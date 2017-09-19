/**

All That Apply Type
August 2017

ochang @ Smith & Associates
**/
var AllThatApply = (function () {

    'use strict';

    /*jslint browser:true */

    function getAnswer(data) {
        // answers: [{
        //   "answerText": "Jem",
        //   "feedBack": "Correct! Jem is Atticus' son.",
        //   "scoreValue": 1
        // }, ...]
        var div, answers;
        div = document.createElement('div');
        div.classList.add('answer-container');
        answers = data.answers.map(function (a, idx) {
            var elId, el, label;
            elId = 'checkbox' + idx;
            el = document.createElement('input');
            el.setAttribute('type', 'checkbox');
            el.setAttribute('id', elId);
            el.setAttribute('value', idx);
            label = document.createElement('label');
            label.classList.add('checkbox-label');
            label.setAttribute('for', elId);
            label.appendChild(document.createTextNode(a.answerText));
            div.appendChild(el);
            div.appendChild(label);
            return div;
        });
        return answers;
    }

    function getResultAttributes(result, getCorrects) {
        if (getCorrects) {
            return {
                className: 'feedback-correct-answer',
                boldText: 'Correct Answer: ',
                value: result.correctAnswer
            };
        }
        return {
            className: 'feedback-selected-answer',
            boldText: 'You selected: ',
            value: result.selected
        };
    }

    function getResult(result, correctAnswerFlag) {
        var attr, el, bold, text;
        attr = getResultAttributes(result, correctAnswerFlag);
        el = document.createElement('p');
        el.classList.add(attr.className);
        bold = document.createElement('b');
        bold.appendChild(document.createTextNode(attr.boldText));
        text = document.createTextNode(attr.value);
        el.appendChild(bold);
        el.appendChild(text);
        return el;
    }

    function checkAnswer(data) {
        var score, maxScore, correctAnswer, selected, result;
        score = 0;
        maxScore = data.maxScoreValue;
        correctAnswer = '';
        selected = '';
        result = data.answers.map(function (a, idx) {
            var inputId = 'checkbox' + idx;
            if (a.scoreValue) {
                correctAnswer = correctAnswer.length > 0 ?
                        correctAnswer + ', ' + a.answerText : a.answerText;
            }
            a.selected = false;
            a.isCorrect = false;
            if (document.getElementById(inputId).checked) {
                a.selected = true;
                selected = selected.length > 0 ?
                        selected + ', ' + a.answerText : a.answerText;
                a.isCorrect = a.scoreValue > 0;
                score += a.scoreValue || -1;
                score = score < 0 ? 0 : score;
            }
            return a;
        }).filter(function (a) { return a.selected; });
        return {
            result: result,
            score: score,
            maxScore: maxScore,
            correctAnswer: correctAnswer,
            selected: selected
        };
    }

    function getFeedback(result) {
        var correctAnswer = getResult(result, true),
            selectedAnswer = getResult(result),
            ul = document.createElement('ul'),
            title = document.createElement('h4');
        title.appendChild(document.createTextNode('Feedback'));
        ul.classList.add('feedback-list');
        result.result.forEach(function (r) {
            var liText = document.createElement('li');
            liText.appendChild(document.createTextNode(r.feedBack));
            ul.appendChild(liText);
        });
        return [
            correctAnswer,
            selectedAnswer,
            title,
            ul
        ];
    }

    return {
        getAnswer: getAnswer,
        getFeedback: getFeedback,
        checkAnswer: checkAnswer
    };

}());
