var $ = jQuery;

var savedActivity = [];
var currentIndex = 0;
var currentModel = null;
var currentQuestion = null;
var quizData = {};
var SELECTORS = {
    header: '.header',
    content: '.content',
    feedbacks: '.feedbacks'
};
var ICON_NAMES = {
    correct: 'done',
    wrong: 'clear',
    partial: 'timelapse'
}

buildQuiz('data/quiz-data.json');

function buildQuiz(jsonFile) {
    $.getJSON(jsonFile, data => {
        quizData = data;
        quizData.Questions.forEach(q => {
            savedActivity.push(null);
        });
        var quizHeader = getQuizHeader(quizData);
        setQuizHeader(quizHeader);
        var preQuiz = getPreQuiz(quizData);
        repopulateContainer(SELECTORS.content, preQuiz);
    });
}

function getQuiz(idx) {
    currentQuestion = quizData.Questions[idx];
    currentModel = getQuestionModel(currentQuestion.questionType);
    if (savedActivity[idx]) {
        document.body.replaceChild(savedActivity[idx], document.querySelector('main'));
    } else {
        if (currentModel) {
            var questionEl = getQuestion(currentModel, quizData, currentQuestion);
            var answerEl = currentModel.getAnswer(
                quizData,
                currentQuestion,
                getAnswerButtons(quizData)
            );
            repopulateContainer(SELECTORS.header, questionEl);
            repopulateContainer(SELECTORS.content, answerEl);
            repopulateContainer(SELECTORS.feedbacks);
        } else {
            // TODO: Notification question model not found
            console.error('No Model of '+ currentQuestion.questionType);
        }
    }
}

function checkAnswer() {
    // TODO: Keep previous progress. if checkanswer remove all next
    var result;
    if (currentModel.checkAnswer) {
        // TODO: Implement model check answer with current question data
        result = currentModel.checkAnswer(currentQuestion);
        var feedbackEl = getFeedback(currentModel, quizData, result);
        repopulateContainer(SELECTORS.feedbacks, feedbackEl);
    } else {
        // TODO: proceed with default checking
        console.error('No default checking.');
    }
}

function getHint() {
    // TODO: show hint for current question
    var text = getText(currentQuestion.hintText, 'hint-text');
    var medias = getHintMedia(currentQuestion.hintMedia);
    var backdrop = createElement('div', null, {className: 'dialog-backdrop'});
    var dialog = createElement('div', null, {className: 'dialog'});
    var closeIcon = getIcon(ICON_NAMES.wrong, 'closeDialog()');

    backdrop.setAttribute('onclick', 'closeDialog()');
    closeIcon.classList.add('close-dialog-button');

    dialog.appendChild(closeIcon);
    dialog.appendChild(text);
    medias.forEach(m => dialog.appendChild(m));
    backdrop.appendChild(dialog);
    document.querySelector('main').appendChild(backdrop);
}

function closeDialog() {
    console.log(document.querySelector('.dialog-backdrop'));
}

function getHintMedia(hintMedias) {
    var media = [];
    if (Array.isArray(hintMedias)) {
        hintMedias.forEach(m => {
            // {
            //   "type": "image",
            //   "src": "http://ih.constantcontact.com/fs077/1101742975031/img/201.jpg",
            //   "description": "A mockingbird.",
            //   "mediaLink": "http://en.wikipedia.org/wiki/Mockingbird"
            // }
            var tag;
            if (m.type == 'image') {
                tag = 'img';
            } else if (m.type == 'video') {
                tag = 'video';
            }
            if (tag) {
                var mediaItem = document.createElement(tag);
                mediaItem.setAttribute('src', m.src);
                mediaItem.setAttribute('alt', m.description);
                mediaItem.setAttribute('class', 'media-item');

                // TODO: Figure out what to do with media link

                media.push(mediaItem);
            }
        });
    }
    return media;
}

function goBack() {
    saveCurrentQuestion();
    getQuiz(--currentIndex);
}

function nextQuestion() {
    saveCurrentQuestion();
    if (++currentIndex === quizData.Questions.length) {
        getPostQuiz(quizData);
    } else {
        getQuiz(currentIndex);
    }
}

function saveCurrentQuestion() {
    savedActivity[currentIndex] = document.querySelector('main').cloneNode(true);
}

function getQuestionModel(questionType) {
    switch (questionType) {
        case 'Matching':
            return Matching;
        case 'All That Apply':
            return AllThatApply;
        case 'Multiple Choice':
            return MultipleChoice;
        case 'Fill In The Blank':
            return FillInTheBlank;
        case 'Math':
            return FillInTheBlank;
        default:
            return null;
    }
}

function getPreQuizButtons() {
    return [
        {
            onclick: 'startQuiz()',
            label: 'Start Quiz',
            className: 'start-quiz'
        }
    ];
}

function getPostQuizButtons() {
    // TODO: return post quiz buttons
}

function getAnswerButtons(data) {
    var checkAnswerButton = {
        onclick: 'checkAnswer()',
        label: 'Check Answer',
        className: 'submit'
    };
    var hintButton = {
        onclick: 'getHint()',
        label: 'Hint',
        className: 'hint'
    };
    var previousButton = {
        onclick: 'goBack()',
        label: 'Go Back',
        className: 'back'
    };
    var buttons = [];
    if (currentIndex > 0 && data.General.allowPrevious) {
        buttons.push(previousButton);
    }
    if (data.General.showHints &&
        ((currentQuestion.hintText && currentQuestion.hintText.toUpperCase() != 'NONE') ||
        (currentQuestion.hintMedia && currentQuestion.hintMedia.toUpperCase() != 'NONE'))
    ) {
        buttons.push(hintButton);
    }
    buttons.push(checkAnswerButton);
    return buttons;
}

function getFeedbackButtons() {
    return [
        {
            label: 'Continue',
            onclick: 'nextQuestion()',
            class: 'next'
        }
    ];
}

function startQuiz() {
    currentIndex = 0;
    getQuiz(currentIndex);
}

function repopulateContainer(selector, elList=[]) {
    $(selector).empty();
    elList.forEach(el => {
        $(selector).append(el);
    });
}

function getQuestion(model, general, data) {
    var title = 'Question ' + (currentIndex + 1) + ' of ' + general.Questions.length;
    var questionTitle = createElement('h2', title, {className: 'question-title'});
    var elList;
    if (model && model.getQuestion) {
        elList = model.getQuestion(general, data);
    } else {
        elList = [
            createElement('p', data.questionText, 'question')
        ];
    }
    return [
        questionTitle, ...elList
    ]
}

function getFeedback(model, general, result) {
    var title = createElement(
        'h3',
        'You scored ' + result.score + '/' + result.maxScore +'!'
    );
    if (model && model.getFeedback) {
        return [
            title,
            ...model.getFeedback(general, result, getFeedbackButtons())
        ];
    } else {
        return [
            title
        ]
    }
}

function getQuizHeader(data) {
    var tag = 'h'+ (data.General.HeadingLevel || 1);
    var el = createElement(tag, data.General.QuizName || 'Quiz');
    return el;
}

function setQuizHeader(el) {
    $('header').empty().append(el);
}

function getText(text, className) {
    if (
        text
        && text.trim().length > 0
        && text != 'none'
    ) {
        var el = createElement(
            'p',
            null,
            {className: className}
        );
        el.innerHTML = text;
        return el;
    }
    return null;
}

function getPreQuiz(data) {
    var instructions = getText(data.General.instructions, 'quiz-instructions');
    var pre = getText(data.General.preQuizText, 'quiz-pre-text');
    var elList = [];
    if (instructions) {
        elList.push(instructions);
    }
    if (pre) {
        elList.push(pre);
    }
    if (elList.length > 0) {
        elList.push(getActionContainer(
            getPreQuizButtons(),
            'answer-actions'
        ));
    } else {
        elList = null;
    }
    return elList;
}

function getPostQuiz(data) {
    // TODO: simulate after quiz is taken (Reports, PostText and Media)
    console.error('Leaving boundaries...');
}

/**
Potential Default Type Functions
**/
function createElement(tag, text, options=null) {
    var el = document.createElement(tag);
    if (text) {
        var text = document.createTextNode(text);
        el.appendChild(text);
    }
    if (options && typeof(options) === 'object') {
        Object.keys(options).forEach(o => {
            el[o] = options[o];
        });
    }
    return el;
}

function getActionContainer(buttons, className) {
    var el = createElement('div', null, {className: className});
    buttons.forEach(button => {
        var buttonEl = createElement('button', button.label, {className: button.className});
        buttonEl.setAttribute('onclick', button.onclick);
        el.appendChild(buttonEl);
    });
    return el;
}

function getFeedbackClassName(c, r) {
    if (r) {
        return c + ' correct';
    } else {
        return c + ' wrong';
    }
}

function getIcon(text, onclick) {
    var el = createElement('i', text, {className: 'material-icons'});
    if (onclick) {
        el.setAttribute('onclick', onclick);
    }
    return el;
}
