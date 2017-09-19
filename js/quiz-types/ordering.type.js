/**

Multiple Choice Quiz Type
September 2017

ochang @ Smith & Associates
**/
var Ordering = (function () {
    'use strict';
    /*jslint browser: true*/
    /*jslint todo: true  */

    // TODO: Only allow one option to be selected

    function random() {
        return Math.random() > 0.5;
    }

    function onChange(e) {
        // reenable all options
        var par = e.currentTarget.parentElement,
            temp = [];
        par.querySelectorAll('option[disabled="true"]').forEach(function (o) {
            o.removeAttribute('disabled');
        });
        par.querySelectorAll('select').forEach(function (select) {
            if (select.value) {
                // selector for selects with same value, different name
                temp = 'select:not([name="' + select.name + '"])';
                temp += '[value="' + select.value + '"]';
                par.querySelectorAll(temp).forEach(function (s) {
                    s.value = undefined;
                });

                // selector for options with same value, select different name
                temp = 'select:not([name="' + select.name + '"]) ';
                temp += 'option[value="' + select.value + '"]';
                par.querySelectorAll(temp).forEach(function (o) {
                    o.setAttribute('disabled', 'true');
                });
            }
        });
    }

    function getSelects(i) {
        if (i === undefined || i === null) {
            i = 0;
        }
        var s = document.createElement('select'),
            o = document.createElement('option');
        s.appendChild(o);
        while (s.children.length <= i) {
            o = document.createElement('option');
            o.appendChild(document.createTextNode(s.children.length));
            o.setAttribute('value', s.children.length);
            s.appendChild(o);
        }
        s.setAttribute('onchange', 'onChange(event)');
        return s;
    }

    function getAnswerContainer(d) {
        // shuffle
        var r = d.sort(random),
            el = document.createElement('div');
        el.classList.add('answer-container');
        r.forEach(function (c) {
            var s = getSelects(d.length);
            s.setAttribute('name', c.answerText);
            el.appendChild(s);
            s = document.createElement('p');
            s.classList.add('select-text');
            s.appendChild(document.createTextNode(c.answerText));
            el.appendChild(s);
        });
        return el;
    }

    function getAnswer(data) {
        /**
        "answers": [
            {
                "answerText": "Dawn",
                "correct": "Correct!",
                "wrong": "This is before sunrise",
                "key": 1
            },
            ...
        ]
        **/
        var answerContainer;
        if (data.dragAndDrop) {
            // TODO: Add drag n drop version of sequence
            answerContainer = [];
        } else {
            answerContainer = getAnswerContainer(data.answers);
        }
        return [
            answerContainer
        ];
    }

    function getFeedback(result) {
        var h2 = document.createElement('h2'),
            div = document.createElement('div'),
            span,
            correct;

        h2.appendChild(document.createTextNode('Feedback'));
        h2.classList.add('feedback-title');
        div.classList.add('feedback-container', 'flex-wrap');
        result.answers.forEach(function (a) {
            span = document.createElement('span');
            span.classList.add('feedback-answer-value');
            span.appendChild(document.createTextNode(
                document.querySelector('select[name="' + a.answerText + '"]').value
            ));
            if (!a.isCorrect) {
                correct = document.createElement('span');
                correct.classList.add('wrong');
                correct.appendChild(document.createTextNode('(' + a.key + ')'));
                span.appendChild(correct);
            }
            div.appendChild(span);
            span = document.createElement('span');
            span.classList.add('feedback-answer-label');
            span.appendChild(document.createTextNode(a.answerText + ' (' + a.feedback + ')'));
            div.appendChild(span);
        });
        return [
            h2,
            div
        ];
    }

    function checkAnswer(data) {
        var result = {},
            el;
        result.score = 0;
        result.maxScore = data.maxScoreValue;
        result.answers = data.answers.map(function (a) {
            el = document.querySelector('select[name="' + a.answerText + '"]');
            a.isCorrect = Number(a.key) === Number(el.value);
            if (result.isCorrect === undefined) {
                result.isCorrect = a.isCorrect;
            } else {
                result.isCorrect = result.isCorrect && a.isCorrect;
            }
            if (a.isCorrect) {
                result.score += a.scoreValue || 0;
                a.feedback = a.correct;
            } else {
                a.feedback = a.wrong;
            }
            return a;
        });
        if (result.isCorrect) {
            result.score = result.maxScore;
        }
        return result;
    }

    return {
        getAnswer: getAnswer,
        getFeedback: getFeedback,
        checkAnswer: checkAnswer,
        onChange: onChange
    };

}());
