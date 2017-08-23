/**

Matching Quiz Type
August 2017

ochang @ Smith & Associates
**/
let Matching = (function() {
    "use strict";

    const INST = `
        Match each item to the appropriate category. For keyboard only users,
        use the tab key to select an answer from the list and use the enter key to select it.
        Use tab again to select the correct dropzone and then hit the enter key to confirm your answer.
        Select an answer and hit the delete key to return it to its original position.
        Use the "Check Answers" button to get your results.
    `;

    return {
        prepareQuestion,
        prepareAnswer,
        prepareFeedback
    };

    function prepareQuestion(general, data) {
        return [
            prepareInstructions(general.showInstruction),
            createElement('p', data.questionText, 'question')
        ];
    }

    function prepareAnswer(general, data) {

    }

    function prepareFeedback(general, data) {

    }

    function prepareInstructions(show=true) {
        if (show) {
            return createElement('p', INST, 'instructions');
        }
        return null;
    }

    function createElement(tag, text, className="") {
        let el = document.createElement(tag);
        el.innerHTML = text;
        el.className = className;
        return el;
    }

})();
