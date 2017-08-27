var $ = jQuery;

var savedActivity = [];
var currentIndex = 0;

var questionEl = Matching.getQuestion({}, matchTypeDummy);
var answerEl = Matching.getAnswer({}, matchTypeDummy, [{
    onclick: 'checkAnswer(matchTypeDummy)',
    label: 'Check Answer',
    className: 'submit'
}]);
var feedbackEl;

function checkAnswer(data) {
    var result = Matching.checkAnswer(data);
    feedbackEl = Matching.getFeedback({}, result.result);
    $('.feedbacks').empty();
    feedbackEl.forEach(f => {
        $('.feedbacks').append(f);
    });
    var temp = {
        checked: true,
        result: result,
        resultNode: document.querySelector('main').cloneNode()
    }
    savedActivity[currentIndex] = temp;
}

function nextQuestion() {
    console.log(savedActivity);
}

questionEl.forEach(q => {
    $('.header').append(q);
});
answerEl.forEach(a => {
    $('.content').append(a);
});
// console.log(matchTypeDummy);
