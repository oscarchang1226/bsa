/**

Fill in the blanks quiz Type
August 2017

ochang @ Smith & Associates
**/
var FillInTheBlank = (function(){

    // TODO: insert feedback; when no feedback dont add element

    var INST = `Fill in the blanks with appropriate answers.`;

    return {
        getQuestion: getQuestion,
        getAnswer: getAnswer,
        getFeedback: getFeedback,
        checkAnswer: checkAnswer
    };

    function getQuestion(general, data) {
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

    function getRegex(flag) {
        return new RegExp(/(BLANK[\d]*)/, flag);
    }

    function createInputs(questionText) {
        var el = document.createElement('p');
        el.innerHTML = questionText.replace(
            getRegex('g'),
            m => {
                return createTextInput({id:m})
            }
        );
        el.classList.add('fill-in-the-blanks-question');
        el.querySelectorAll('input[type="text"]').forEach(
            i => {
                i.addEventListener('keyup', onKeyUp);
                i.addEventListener('blur', onBlur)
            }
        );
        return el;
    }

    function createTextInput(options={}) {
        var textInput = '<input type="text" ';
        Object.keys(options).forEach(opt => {
            textInput += opt+'="'+options[opt]+'" ';
        });
        textInput += '/>';
        return textInput;
    }

    function onKeyUp(e) {
        if (this != e.target || e.defaultPrevented) {
            return;
        }
        if (e.key == 'Enter') {
            e.target.value = e.target.value.trim();
            var checkAnswerButton = document.querySelector('.answer-actions button.submit');
            if (checkAnswerButton) {
                checkAnswerButton.click();
            }
        }
    }

    function onBlur(e) {
        if (this != e.target || e.defaultPrevented) {
            return;
        }
        e.target.value = e.target.value.trim();
    }

    function getInstructions(show=true) {
        if (show) {
            var p = document.createElement('p');
            p.appendChild(document.createTextNode(INST));
            p.classList.add('instructions');
            return p;
        }
        return null;
    }

    function getAnswer(general, data, buttons) {
        return [
            getActionContainer(buttons, 'answer-actions')
        ];
    }

    function getFeedback(general, result, buttons) {
        var correctAnswer = document.createElement('p');
        correctAnswer.innerHTML = '<b>Correct Answer: </b>' + result.correctAnswer;
        correctAnswer.classList.add('feedback-correct-answer');

        var selectedAnswer = document.createElement('p');
        selectedAnswer.innerHTML = '<b>You answered: </b>' + result.selected;
        selectedAnswer.classList.add('feedback-selected-answer');

        return [
            correctAnswer,
            selectedAnswer,
            getActionContainer(buttons, 'feedback-actions')
        ];
    }

    function checkAnswer(data) {
        var maxScore = data.maxScoreValue;
        var score = 0;
        var correctAnswer = data.questionText;
        var selected = data.questionText;
        data.answers.forEach(a => {
            correctAnswer = correctAnswer.replace(
                getRegex(),
                m => '<b>'+a.answerText+'</b>'
            );
        });
        document.querySelectorAll('input[type="text"]').forEach((item, idx) => {
            var answer = data.answers[idx];
            var value = item.value.toUpperCase();
            selected = selected.replace(
                item.id,
                '<b>'+value+'</b>'
            );
            if (answer.answerText.toUpperCase() == value) {
                score += answer.scoreValue;
            } else if (answer.altAnswers) {
                var alt = answer.altAnswers.find(
                    a => a.answerText.toUpperCase() == value
                );
                if (alt) {
                    score += alt.scoreValue;
                }
            }
        });
        return {
            maxScore: maxScore,
            score: score,
            correctAnswer: correctAnswer,
            selected: selected
        };
    }

})();
