/**

All That Apply Type
August 2017

ochang @ Smith & Associates
**/
var AllThatApply = (function() {
    return {
        getAnswer: getAnswer,
        getFeedback: getFeedback,
        checkAnswer: checkAnswer
    }

    function getAnswer(general, data, buttons) {
        // answers: [{
        //   "answerText": "Jem",
        //   "feedBack": "Correct! Jem is Atticus' son.",
        //   "scoreValue": 1
        // }, ...]
        var div = createElement('div', null, {className: 'answer-container'});
        var answers = data.answers.map((a,idx) => {
            var elId = 'checkbox'+idx;
            var el = createElement('input');
            el.setAttribute('type', 'checkbox');
            el.setAttribute('id', elId);
            el.setAttribute('value', idx);
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
        var correctAnswer = '';
        var selected = '';
        var result = data.answers.map((a, idx) => {
            var inputId = 'checkbox'+idx;
            if (a.scoreValue) {
                correctAnswer = correctAnswer.length > 0?
                    correctAnswer + ', ' + a.answerText : a.answerText;
            }
            if (document.getElementById(inputId).checked) {
                a.selected = true;
                selected = selected.length > 0?
                    selected + ', ' + a.answerText : a.answerText;
                a.isCorrect = a.scoreValue > 0;
                score += a.scoreValue || -1;
                score = score < 0? 0 : score;
            }
            return a;
        }).filter(a => a.selected);
        return {
            result: result,
            score: score,
            maxScore: maxScore,
            correctAnswer: correctAnswer,
            selected: selected
        };
    }

    function getFeedback(general, result, buttons) {
        var correctAnswer = getCorrectAnswer(result);
        var selectedAnswer = getSelectedAnswer(result);
        var ul = createElement('ul', null, {className: 'feedback-list'});
        var feedbacks = result.result.forEach(r => {
            var liText = createElement(
                'li',
                'Feedback: ' + r.feedBack
            );
            ul.appendChild(liText);
        });
        return [
            correctAnswer,
            selectedAnswer,
            ul,
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

})();
