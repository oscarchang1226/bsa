(function(){
    "use strict";

    let $ = jQuery;

    console.log($('.header'));
    let questionEl = Matching.prepareQuestion({}, matchTypeDummy);
    questionEl.forEach(q => {
        $('.header').append(q);
    });
    // console.log(matchTypeDummy);

})();
