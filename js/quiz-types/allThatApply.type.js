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
        var div, answers, correctAnswers;
        div = document.createElement('div');
        div.classList.add('answer-container');
        correctAnswers = data.answers.filter(function (a) {
            return a.scoreValue;
        });
        correctAnswers = correctAnswers.length;
        answers = data.answers.map(function (a, idx) {
            a.elId = 'checkbox' + idx;
            a.elValue = idx;
            return a;
        });
        answers = answers.sort(function () {
            return 0.5 - Math.random();
        });
        answers.forEach(function (a) {
            var el, label;
            el = document.createElement('input');
            el.setAttribute('type', 'checkbox');
            el.setAttribute('id', a.elId);
            el.setAttribute('value', a.elValue);
            label = document.createElement('label');
            label.classList.add('checkbox-label');
            label.setAttribute('for', a.elId);
            label.appendChild(document.createTextNode(a.answerText));
            div.appendChild(el);
            div.appendChild(label);
        });
        return [div];
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
        var score, maxScore, scoreValue, scoreAdjust, correctAnswer, selected, result;
        score = 0;
        scoreAdjust = 0;
        maxScore = data.maxScoreValue;
        correctAnswer = '';
        selected = '';
        scoreValue = maxScore / data.answers.reduce(function (carrier, a) {
            if (a.scoreValue) {
                carrier += 1;
            }
            return carrier;
        }, 0);
        result = data.answers.map(function (a, idx) {
            var inputId = 'checkbox' + idx;
            if (a.scoreValue) {
                correctAnswer = correctAnswer.length > 0 ?
                        correctAnswer + ', ' + a.answerText : a.answerText;
                a.scoreValue = scoreValue;
            }
            a.selected = false;
            a.isCorrect = false;
            if (document.getElementById(inputId).checked) {
                a.selected = true;
                selected = selected.length > 0 ?
                        selected + ', ' + a.answerText : a.answerText;
                a.isCorrect = a.scoreValue > 0;
                if (a.scoreValue) {
                    score += a.scoreValue;
                } else {
                    scoreAdjust += scoreValue;
                }
                score = score < 0 ? 0 : score;
            }
            return a;
        }).filter(function (a) { return a.selected; });
        score = score - scoreAdjust;
        score = Number(score.toFixed(1));
        if (score > maxScore) {
            score = maxScore;
        } else if (score < 0) {
            score = 0;
        }
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
            if (r.feedBack) {
                var liText = document.createElement('li');
                liText.appendChild(document.createTextNode(r.feedBack));
                ul.appendChild(liText);
            }
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
