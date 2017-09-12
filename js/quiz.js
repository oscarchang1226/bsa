/*jslint browser: true*/
/*global $, jQuery*/

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
};

function getQuizHeader(data) {
    var tag = 'h'+ (data.General.HeadingLevel || 1);
    var el = createElement(tag, data.General.QuizName || 'Quiz');
    return el;
}

function setQuizHeader(el) {
    $('header').empty().append(el);
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

function buildQuiz(jsonFile) {
    'use strict';
    $.getJSON(jsonFile, function (data) {
        quizData = data;
        quizData.Questions = quizData.Questions.filter(
            function (q) {
                return !q.skip;
            }
        );
        quizData.Questions.forEach(
            function () {
                return savedActivity.push(null);
            }
        );
        var quizHeader = getQuizHeader(quizData);
        setQuizHeader(quizHeader);
        var preQuiz = getPreQuiz(quizData);
        // repopulateContainer(SELECTORS.content, preQuiz);
        getQuiz(currentIndex);
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
            var answerEl = getAnswer(
                currentModel,
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

function getAnswer(model, data, question, buttons) {
    if (model.getAnswer) {
        var answerEl = model.getAnswer(buttons, question, data);
        return answerEl;
    }
    return null;
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
    var closeIcon = getIcon(ICON_NAMES.wrong);

    closeIcon.addEventListener('click', closeDialog);
    backdrop.addEventListener('click', closeDialog);
    closeIcon.classList.add('close-dialog-button');

    dialog.appendChild(closeIcon);
    dialog.appendChild(text);
    medias.forEach(function (m) { dialog.appendChild(m); });
    backdrop.appendChild(dialog);
    document.querySelector('main').appendChild(backdrop);
}

function closeDialog(e) {
    // prevent nested elements from invoking the handler
    if (this != e.target) {
        return;
    }
    document.querySelector('.dialog-backdrop').remove();
}

function getHintMedia(hintMedias) {
    var media = [];
    if (Array.isArray(hintMedias)) {
        hintMedias.forEach(function (m) {
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

function resetAll() {
    if (currentModel.resetAll) {
        currentModel.resetAll();
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
            return Arithmetic;
        case 'Ordering':
            return Ordering;
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
    var resetAllButton = {
        onclick: 'resetAll()',
        label: 'Reset All',
        className: 'reset'
    };
    var checkAnswerButton = {
        onclick: 'checkAnswer()',
        label: 'Check Answers',
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
    if (currentQuestion.reset) {
        buttons.push(resetAllButton);
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

function repopulateContainer(selector, elList) {
    if (elList === undefined || elList === null) {
        elList = [];
    }
    $(selector).empty();
    elList.forEach(function (el) {
        if (el instanceof HTMLElement) {
            $(selector).append(el);
        }
    });
}

function getQuestion(model, general, data) {
    var title = 'Question ' + (currentIndex + 1) + ' of ' + general.Questions.length;
    var questionTitle = createElement('h2', title, {className: 'question-title'});
    var elList;
    if (model && model.getQuestion) {
        elList = model.getQuestion(data, general);
    } else {
        elList = [
            createElement('p', data.questionText, 'question')
        ];
    }

    return [questionTitle].concat(elList);
}

function getFeedback(model, general, result) {
    var title = document.createElement('h2');
    title.appendChild(document.createTextNode('Results: '));
    title.classList.add('feedback-title');

    var score = document.createElement('h3');
    var scoreText = 'You scored ' + result.score + '/' + result.maxScore +'!';
    var icon;
    if (result.score == result.maxScore) {
        icon = getIcon(ICON_NAMES.correct);
        icon.classList.add('correct');
        scoreText = 'Your answer was correct. +'+result.score;
    } else if (result.score > 0) {
        icon = getIcon(ICON_NAMES.partial);
        icon.classList.add('partial');
        scoreText = 'Your answer was partially correct. +'+result.score;
    } else {
        icon = getIcon(ICON_NAMES.wrong);
        icon.classList.add('wrong');
        scoreText = 'Your answer was incorrect.';
    }
    score.classList.add('result-score-text');
    score.appendChild(icon);
    score.appendChild(document.createTextNode(scoreText));

    var feedback = [title, score];
    if (model && model.getFeedback) {
        feedback = feedback.concat(
            model.getFeedback(result, getFeedbackButtons(), general)
        );
    }
    return feedback;
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

function getPostQuiz(data) {
    // TODO: simulate after quiz is taken (Reports, PostText and Media)
    console.error('Leaving boundaries...');
}

/**
Potential Default Type Functions
**/
function createElement(tag, text, options) {
    var el = document.createElement(tag);
    if (text) {
        var text = document.createTextNode(text);
        el.appendChild(text);
    }
    if (options && typeof(options) === 'object') {
        Object.keys(options).forEach(function(o) {
            el[o] = options[o];
        });
    }
    return el;
}

function getActionContainer(buttons, className) {
    var el = createElement('div', null, {className: className});
    buttons.forEach(function (button) {
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
