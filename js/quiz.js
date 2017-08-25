(function(){

    var $ = jQuery;

    console.log($('.header'));
    var questionEl = Matching.prepareQuestion({}, matchTypeDummy);
    var answerEl = Matching.prepareAnswer({}, matchTypeDummy);
    questionEl.forEach(q => {
        $('.header').append(q);
    });
    answerEl.forEach(a => {
        $('.content').append(a);
    });
    // console.log(matchTypeDummy);

})();
