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
        var div = document.createElement('div');
        div.classList.add('answer-container');
        var answers = data.answers.map((a,idx) => {
            var elId = 'checkbox'+idx;
            var el = document.createElement('input');
            el.setAttribute('type', 'checkbox');
            el.setAttribute('id', elId);
            el.setAttribute('value', idx);
            var label = document.createElement('label');
            label.classList.add('checkbox-label');
            label.setAttribute('for', elId);
            label.appendChild(document.createTextNode(a.answerText));
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
            a.selected = false;
            a.isCorrect = false;
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
        var correctAnswer = getResult(result, true);
        var selectedAnswer = getResult(result);
        var title = document.createElement('h4');
        title.appendChild(document.createTextNode('Feedback'));
        var ul = document.createElement('ul');
        ul.classList.add('feedback-list');
        var feedbacks = result.result.forEach(r => {
            var liText = document.createElement('li');
            liText.appendChild(document.createTextNode(r.feedBack));
            ul.appendChild(liText);
        });
        return [
            correctAnswer,
            selectedAnswer,
            title,
            ul,
            getActionContainer(
                 buttons,
                 'feedback-actions'
             )
        ];
    }

    function getResult(result, correctAnswerFlag) {
        var attr = getResultAttributes(result, correctAnswerFlag);
        var el = document.createElement('p');
        el.classList.add(attr.className);
        var bold = document.createElement('b');
        bold.appendChild(document.createTextNode(attr.boldText));
        var text = document.createTextNode(attr.value);
        el.appendChild(bold);
        el.appendChild(text);
        return el;
    }

    function getResultAttributes(result, getCorrects) {
        if (getCorrects) {
            return {
                className: 'feedback-correct-answer',
                boldText: 'Correct Answer: ',
                value: result.correctAnswer
            }
        } else {
            return {
                className: 'feedback-selected-answer',
                boldText: 'You selected: ',
                value: result.selected
            };
        }
    }

})();
