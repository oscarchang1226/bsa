/**

Fill in the blanks quiz Type
August 2017

ochang @ Smith & Associates
**/
var FillInTheBlank = (function () {
    'use strict';
    /*jslint browser:true */


    var INST = 'Fill in the blanks with appropriate answers.';

    function getInstructions(show) {
        if (show === undefined) {
            show = true;
        }
        if (show) {
            var p = document.createElement('p');
            p.appendChild(document.createTextNode(INST));
            p.classList.add('instructions');
            return p;
        }
        return null;
    }

    function getRegex(flag) {
        return new RegExp(/(BLANK[\d]*)/, flag);
    }

    function createTextInput(options) {
        if (!options) {
            options = {};
        }
        var textInput = '<input type="text" ';
        Object.keys(options).forEach(function (opt) {
            textInput += opt + '="' + options[opt] + '" ';
        });
        textInput += '/>';
        return textInput;
    }

    function onKeyUp(e) {
        if (this !== e.target || e.defaultPrevented) {
            return;
        }
        if (e.key === 'Enter') {
            e.target.value = e.target.value.trim();
            var checkAnswerButton = document.querySelector('.actions button.submit');
            if (checkAnswerButton) {
                checkAnswerButton.click();
            }
        }
    }

    function onBlur(e) {
        if (this !== e.target || e.defaultPrevented) {
            return;
        }
        e.target.value = e.target.value.trim();
    }

    function createInputs(questionText) {
        var el = document.createElement('p');
        el.innerHTML = questionText.replace(
            getRegex('g'),
            function (m) {
                return createTextInput({id: m});
            }
        );
        el.classList.add('fill-in-the-blanks-question');
        el.querySelectorAll('input[type="text"]').forEach(
            function (i) {
                i.addEventListener('keyup', onKeyUp);
                i.addEventListener('blur', onBlur);
            }
        );
        return el;
    }

    function getQuestion(data) {
        /**
        "questionType":"Fill In The Blank",
        "maxScoreValue": 4,
        "questionText":"To BLANK1 a BLANK2 is probably the most widely read BLANK3 dealing with race in BLANK4.",
        "hintText":"Known to mimic the songs of other birds.",
        "hintMedia":[
          {
            "type": "image",
            "src": "http://ih.constantcontact.com/fs077/1101742975031/img/201.jpg",
            "description": "A mockingbird.",
            "mediaLink": "http://en.wikipedia.org/wiki/Mockingbird"
          }
        ],
        "answers": [...]
        **/
        return [
            getInstructions(),
            createInputs(data.questionText)
        ];
    }

    function getFeedback(result) {
        var correctAnswer = document.createElement('p'),
            selectedAnswer = document.createElement('p');
        correctAnswer.innerHTML = '<b>Correct Answer: </b>' + result.correctAnswer;
        correctAnswer.classList.add('feedback-correct-answer');

        selectedAnswer.innerHTML = '<b>You answered: </b>' + result.selected;
        selectedAnswer.classList.add('feedback-selected-answer');

        return [
            correctAnswer,
            selectedAnswer
        ];
    }

    function checkAnswer(data) {
        var maxScore = data.maxScoreValue,
            score = 0,
            correctAnswer = data.questionText,
            selected = data.questionText,
            isCorrect = true;
        data.answers.forEach(function (a) {
            correctAnswer = correctAnswer.replace(
                getRegex(),
                function () { return '<b>' + a.answerText + '</b>'; }
            );
        });
        document.querySelectorAll('input[type="text"]').forEach(function (item, idx) {
            var answer = data.answers[idx],
                value = item.value.toUpperCase(),
                alt;
            selected = selected.replace(
                item.id,
                '<b>' + value + '</b>'
            );
            if (answer.answerText.toUpperCase() === value) {
                score += answer.scoreValue;
            } else if (answer.altAnswers) {
                alt = answer.altAnswers.find(
                    function (a) { return a.answerText.toUpperCase() === value; }
                );
                if (alt) {
                    score += alt.scoreValue;
                } else {
                    if (isCorrect) {
                        isCorrect = false;
                    }
                }
            } else {
                if (isCorrect) {
                    isCorrect = false;
                }
            }
        });
        return {
            maxScore: maxScore,
            score: isCorrect? maxScore : 0,
            correctAnswer: correctAnswer,
            selected: selected
        };
    }

    return {
        getQuestion: getQuestion,
        getFeedback: getFeedback,
        checkAnswer: checkAnswer
    };

}());
