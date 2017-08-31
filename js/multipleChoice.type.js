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
        var div = createElement('div', null, {className: 'answer-container'});
        var answers = data.answers.map((a,idx) => {
            var elId = 'radioButton'+idx;
            var el = createElement('input');
            el.setAttribute('type', 'radio');
            el.setAttribute('id', elId);
            el.setAttribute('value', idx);
            el.setAttribute('name', 'selectedAnswer');
            var label = createElement('label', a.answerText);
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
        var correctAnswer = getCorrectAnswer(result);
        var selectedAnswer = getSelectedAnswer(result);
        var feedback = getAnswerFeedback(result);
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

    function getCorrectAnswer(result) {
        var option = {
            className: 'feedback-correct-answer'
        };
        var el = createElement('p', null, option);
        var bold = createElement('b', 'Correct Answer: ');
        var text = document.createTextNode(result.correctAnswer);
        el.appendChild(bold);
        el.appendChild(text);
        return el;
    }

    function getSelectedAnswer(result) {
        var option = {
            className: 'feedback-selected-answer'
        };
        var el = createElement('p', null, option);
        var bold = createElement('b', 'You selected: ');
        var text = document.createTextNode(result.selected);
        el.appendChild(bold);
        el.appendChild(text);
        return el;
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
