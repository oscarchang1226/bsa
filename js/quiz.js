(function(){

    var $ = jQuery;

    console.log($('.header'));
    var questionEl = Matching.prepareQuestion({}, matchTypeDummy);
    questionEl.forEach(q => {
        $('.header').append(q);
    });
    // console.log(matchTypeDummy);

})();
