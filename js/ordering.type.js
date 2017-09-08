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
        var r = d.sort((a,b) => Math.random() > 0.5);
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

    }

    function checkAnswer(data) {
        console.log(data);
        return {};
    }


})();
