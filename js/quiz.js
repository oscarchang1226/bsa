var $ = jQuery;

var questionEl = Matching.prepareQuestion({}, matchTypeDummy);
var expected = Matching.getValidationProvider(matchTypeDummy);
var answerEl = Matching.prepareAnswer({}, matchTypeDummy, {
    next: 'Matching.checkAnswer(expected)'
});
questionEl.forEach(q => {
    $('.header').append(q);
});
answerEl.forEach(a => {
    $('.content').append(a);
});
// console.log(matchTypeDummy);
