/**

Multiple Choice Quiz Type
September 2017

ochang @ Smith & Associates
**/
var Ordering = (function (){

    return {
        getAnswer: getAnswer,
        getFeedback: getFeedback,
        checkAnswer: checkAnswer
    };

    function getAnswer(general, data, buttons) {
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
        } else {
            answerContainer = getAnswerContainer(data.answers);
        }
        return [
            answerContainer,
            getActionContainer(buttons, 'answer-actions')
        ];
    }

    function getAnswerContainer(d) {
        // shuffle
        var r = d.sort(random);
        var el = document.createElement('div');
        el.classList.add('answer-container');
        r.forEach((c,idx) => {
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

    function getSelects(i=0) {
        var s = document.createElement('select');
        var emptyOption = document.createElement('option');
        s.appendChild(emptyOption);
        while(s.children.length <= i) {
            var o = document.createElement('option');
            o.appendChild(document.createTextNode(s.children.length));
            o.setAttribute('value', s.children.length);
            s.appendChild(o);
        }
        return s;
    }

    function getFeedback(general, result, buttons) {
        var h2 = document.createElement('h2');
        h2.appendChild(document.createTextNode('Feedbacks: '));
        h2.classList.add('feedback-title');
        var div = document.createElement('div');
        div.classList.add('feedback-container', 'flex-wrap');
        result.answers.forEach(a => {
            var span = document.createElement('span');
            span.classList.add('feedback-answer-value');
            span.appendChild(document.createTextNode(
                document.querySelector('select[name="'+a.answerText+'"]').value
            ));
            if (!a.isCorrect) {
                var correct = document.createElement('span');
                correct.classList.add('wrong');
                correct.appendChild(document.createTextNode('('+a.key+')'));
                span.appendChild(correct);
            }
            div.appendChild(span);
            span = document.createElement('span');
            span.classList.add('feedback-answer-label');
            span.appendChild(document.createTextNode(a.answerText + ' ('+a.feedback+')'));
            div.appendChild(span);
        });
        return [
            h2,
            div,
            getActionContainer(buttons, 'feedback-actions')
        ];
    }

    function checkAnswer(data) {
        var result = {};
        result.score = 0;
        result.maxScore = data.maxScoreValue;
        result.answers = data.answers.map(a => {
            var el = document.querySelector('select[name="'+a.answerText+'"]');
            a.isCorrect = a.key == el.value;
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

    function random(a, b) {
        return Math.random() > 0.5;
    }

    function getResultIcon(isCorrect) {
        var i = document.createElement('i');
        var label;
        var xtraClass;
        if (isCorrect) {
            label = 'check';
            xtraClass = 'correct';
        } else {
            label = 'clear';
            xtraClass = 'wrong';
        }
        i.classList.add('material-icons', xtraClass);
        i.appendChild(document.createTextNode(label));
        return i;
    }

})();
