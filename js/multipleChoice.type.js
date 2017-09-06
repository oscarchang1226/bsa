/**

Matching Quiz Type
August 2017

ochang @ Smith & Associates
**/
var MultipleChoice = (function() {
    return {
        getAnswer: getAnswer,
        checkAnswer: checkAnswer,
        getFeedback: getFeedback
    };

    function getAnswer(general, data, buttons) {
        /**
        answers: [
        {
          "answerText": "Jean-Louise Finch",
          "feedBack": "Correct!",
          "scoreValue": 1
        },
        ...]
        **/
        var div = document.createElement('div');
        div.classList.add('answer-container');
        var answers = data.answers.map((a,idx) => {
            var elId = 'radioButton'+idx;
            var el = document.createElement('input');
            el.setAttribute('type', 'radio');
            el.setAttribute('id', elId);
            el.setAttribute('value', idx);
            el.setAttribute('name', 'selectedAnswer');
            var label = document.createElement('label');
            label.appendChild(document.createTextNode(a.answerText));
            label.classList.add('radio-label');
            label.setAttribute('for', elId);
            div.appendChild(el);
            div.appendChild(label);
            return div;
        });
        return [
            ...answers,
            getActionContainer(buttons, 'answer-actions')
        ];
    }

    function checkAnswer(data) {
        var score = 0;
        var maxScore = data.maxScoreValue;
        var temp = data.answers.map((a, idx) => {
            a.id = idx;
            return a;
        });
        var correctAnswer = temp.find(a => {
            return a.scoreValue > 0;
        });
        var selected = temp.find((a, idx) => {
            var el = document.getElementById('radioButton'+idx);
            return el.checked;
        });
        selected.isCorrect = correctAnswer.id == selected.id;
        return {
            score: selected.isCorrect? maxScore : score,
            maxScore: maxScore,
            correctAnswer: correctAnswer.answerText,
            selected: selected.answerText,
            result: selected
        };
    }

    function getFeedback(general, result, buttons) {
        var correctAnswer = getResult(result, 'c');
        var selectedAnswer = getResult(result, 's');
        var feedback = getResult(result, 'f');
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

    function getResult(result, isCorrect) {
        var attr = getResultAttributes(result, isCorrect);
        var el = document.createElement('p');
        el.classList.add(attr.className);
        var bold = document.createElement('b');
        bold.appendChild(document.createTextNode(attr.boldText));
        var text = document.createTextNode(attr.value);
        el.appendChild(bold);
        el.appendChild(text);
        return el;
    }

    function getResultAttributes(result, type) {
        var result;
        if (type == 'c') {
            result = {
                className: 'feedback-correct-answer',
                boldText: 'Correct Answer: ',
                value: result.correctAnswer
            }
        } else if (type == 's'){
            result = {
                className: 'feedback-selected-answer',
                boldText: 'You selected: ',
                value: result.selected
            };
        } else if (type == 'f') {
            result = {
                className: 'feedback-item',
                boldText: 'Feedback: ',
                value: result.result.feedBack
            };
        }
        return result;
    }

    function getAnswerFeedback(result) {
        var option = {
            className: 'feedback-item'
        };
        var el = createElement('p', null, option);
        var bold = createElement('b', 'Feedback: ');
        var text = document.createTextNode(result.result.feedBack);
        el.appendChild(bold);
        el.appendChild(text);
        return el;
    }

})();
