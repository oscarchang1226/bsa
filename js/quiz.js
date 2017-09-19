/*jslint browser: true*/
/*global $, jQuery, CSVal, console */

/*
CSVal.init();obj = {
      "Comments": {"Content": "Go to MyEducator for more details.", "Type": "Text"},
      "PrivateComments": {"Content": "Go to MyEducator to see any private comments", "Type": "Text"},
      "GradeObjectType": 1,
      "PointsNumerator": 5
};url = '/d2l/api/le/1.25/7143/grades/703/values/204';valence_req.put(url).send(obj).use(valence_auth).end((err, res) => console.log(res));
*/

var $ = jQuery;
var CSVal = CSVal || {};
// try {
//     CSVal.init();
// } catch (e) {
//     console.error('Valence not initiated', e);
// }
$.getJSON('data/api-dummy.json', function (data) {
    CSVal = data;
});


var savedActivity = [];
var savedScores = 0;
var maxScore = 0;
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

/**
    Quiz Pre Functions
**/

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

function getQuiz(idx) {
    document.body.scrollTop = 0;
    currentQuestion = quizData.Questions[idx];
    currentModel = getQuestionModel(currentQuestion.questionType);
    if (savedActivity[idx]) {
        document.body.replaceChild(savedActivity[idx], document.querySelector('main'));
        addButtonEvents();
    } else {
        if (currentModel) {
            var questionEl = getQuestion(currentModel, quizData, currentQuestion);
            var answerEl = getAnswer(
                currentModel,
                quizData,
                currentQuestion
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

function startQuiz() {
    currentIndex = 1;
    getQuiz(currentIndex);
}

function havePostQuizText(data) {
    return data.postQuizText && data.postQuizText !== 'none';
}

function havePostQuizMedia(data) {
    return data.postQuizMedia && data.postQuizMedia.length > 0;
}

function havePostQuiz(data) {
    return !data.General.skipPostQuiz && (havePostQuizText(data.General) || havePostQuizMedia(data.General));
}

function getPreQuiz(data) {
    var instructions = getText(data.General.instructions, 'quiz-instructions'),
        pre = getText(data.General.preQuizText, 'quiz-pre-text'),
        elList = [],
        temp;
    if (instructions) {
        elList.push(instructions);
    }
    if (pre) {
        elList.push(pre);
    }
    if (elList.length > 0) {
        temp = document.createElement('div');
        temp.classList.add('answer-actions');
        getPreQuizButtons().forEach(function (b) {
            temp.appendChild(b);
        });
        elList.push(temp);
    } else {
        elList = null;
    }
    return elList;
}

function getPostQuiz(data, containerParent) {
    var text,
        medias,
        elList = [],
        temp;
    if (havePostQuizText(data.General)) {
        text = getText(data.General.postQuizText, 'quiz-post-text');
        elList.push(text);
    }
    if (havePostQuizMedia(data.General)) {
        medias = document.createElement('div');
        medias.classList.add('quiz-post-media');
        data.General.postQuizMedia.forEach(function (media) {
            medias.appendChild(getMedia(media, containerParent));
        });
        elList.push(medias);
    }
    temp = document.createElement('div');
    temp.classList.add('answer-actions');
    getPostQuizButtons(data).forEach(function (b) {
        temp.appendChild(b);
    });
    elList.push(temp);
    return elList;
}

function getMedia(media, containerParent) {
    var el, temp;
    switch (media.type.toUpperCase()) {
        case 'VIDEO':
            el = document.createElement('video');
            el.setAttribute('controls', 'controls');
            break;
        case 'YOUTUBEVIDEO':
            el = document.createElement('iframe');
            el.setAttribute('frameborder', '0');
            el.setAttribute('allowfullscreen', '');
            break;
        case 'IMAGE':
            el = document.createElement('img');
            break;
        default:
            console.error('No support for media ' + media.type);
            return;
    }
    el.setAttribute('src', media.src);
    el.setAttribute('alt', media.alt || media.type);
    if (media.type.toUpperCase() === 'YOUTUBEVIDEO') {
        temp = document.querySelector(containerParent);
        if (temp) {
            var width = media.width && media.width !== 'none'? media.width : temp.offsetWidth,
                height = width * 0.5625;
            el.setAttribute('width', width);
            el.setAttribute('height', height);
        } else {
            el.setAttribute('width', 480);
            el.setAttribute('height', 480 * .5625);
        }
    } else {
        if (media.height && media.height !== 'none' && !el.getAttribute('height')) {
            el.setAttribute('height', media.height);
        }
        if (media.width && media.width !== 'none' && !el.getAttribute('width')) {
            el.setAttribute('width', media.width);
        }
    }
    return el;
}

function endQuiz() {
    if (havePostQuiz(quizData)) {
        repopulateContainer(SELECTORS.header);
        repopulateContainer(SELECTORS.feedbacks);
        repopulateContainer(
            SELECTORS.content,
            getPostQuiz(quizData, SELECTORS.content)
        );
    } else {
        finish();
    }
}

function finish() {
    // TODO: click parent frame next button
    console.warn('Finish...');
    var incomingGradeValue = {
        GradeObjectType: 1,
        PointsNumerator: score,
        Comments: {
            Content: '',
            Type: 'Text'
        },
        PrivateComments: {
            Content: '',
            Type: 'Text'
        }
    };
    if (parent && parent.document) {
        var nextButton = parent.document.querySelector('a.d2l-iterator-button-next'),
            cb = function () {
                if (nextButton) {
                    return nextButton.click();
                }
            };
        return SMI.put_grades(7143, 703, 213, incomingGradeValue, cb);
    }
    // TODO: Maybe use a dialog for this
    console.warn('Cannot find next button');
}

/**
    Button Providers
*/

function getPreQuizButtons() {
    var startQuizButton = {
            label: 'Start Quiz',
            className: 'start-quiz'
        },
        buttons = [],
        button;
    button = getButtonElement(startQuizButton);
    buttons.push(button);
    return buttons;
}

function getPostQuizButtons() {
    var finishButton = {
        label: 'Finish Quiz',
        className: 'finish'
        },
        buttons = [],
        button;
    button = getButtonElement(finishButton);
    buttons.push(button);
    return buttons;
}

function getAnswerButtons(data) {
    var resetAllButton = {
            label: 'Reset All',
            className: 'reset'
        },
        checkAnswerButton = {
            label: 'Check Answers',
            className: 'submit'
        },
        hintButton = {
            label: 'Hint',
            className: 'hint'
        },
        previousButton = {
            label: 'Go Back',
            className: 'back'
        },
        buttons = [],
        button;
    if (currentIndex > 0 && data.General.allowPrevious) {
        buttons.push(previousButton);
    }
    if (currentQuestion.reset) {
        buttons.push(resetAllButton);
    }
    if (data.General.showHints &&
        ((currentQuestion.hintText && currentQuestion.hintText.toUpperCase() !== 'NONE') ||
        (currentQuestion.hintMedia && currentQuestion.hintMedia.toUpperCase() !== 'NONE'))
    ) {
        buttons.push(hintButton);
    }
    buttons.push(checkAnswerButton);
    buttons = buttons.map(function (b) {
        return getButtonElement(b);
    });
    return buttons;
}

function getFeedbackButtons(data) {
    var contButton = {
            label: 'Continue',
            className: 'next'
        },
        endQuizButton = {
            label: 'End Quiz',
            className: 'end-quiz'
        },
        finishButton = {
            label: 'Next Topic',
            className: 'finish'
        },
        buttons = [],
        button;
    if (currentIndex === data.Questions.length-1) {
        if (havePostQuiz(data)) {
            button = getButtonElement(endQuizButton);
        } else {
            button = getButtonElement(finishButton);
        }
    } else {
        button = getButtonElement(contButton);
    }
    buttons.push(button);
    return buttons;
}

function getButtonElement(obj) {
    var button = document.createElement('button');
    button.classList.add(obj.className);
    button.appendChild(document.createTextNode(obj.label));
    button.addEventListener('click', getButtonEvent(obj.className));
    return button;
}

function addButtonEvents() {
    document.querySelectorAll('div.answer-actions button, div.feedback-actions button').forEach(function (b) {
        b.addEventListener('click', getButtonEvent(b.className));
    });
}

function getButtonEvent(className) {
    switch(className) {
        case 'start-quiz':
            return startQuiz;
        case 'reset':
            return resetAll;
        case 'submit':
            return checkAnswer;
        case 'hint':
            return getHint;
        case 'back':
            return goBack;
        case 'next':
            return nextQuestion;
        case 'end-quiz':
            return endQuiz;
        case 'finish':
            return finish;
        default:
            return null;
    }
}
/**
    End Button Providers
*/


function getQuizHeader(data) {
    var tag = 'h'+ (data.General.HeadingLevel || 1);
    var el = createElement(tag, data.General.QuizName || 'Quiz');
    return el;
}

function setQuizHeader(el) {
    $('header').empty().append(el);
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
        repopulateContainer(SELECTORS.content, preQuiz);
        // getQuiz(currentIndex);
    });
}

function getAnswer(model, data, question) {
    var buttons = getAnswerButtons(data),
        answerEl = [],
        actionContainer = document.createElement('div');
        actionContainer.classList.add('answer-actions');
        buttons.forEach(function (button) {
            actionContainer.appendChild(button);
        });
    if (model.getAnswer) {
        answerEl = model.getAnswer(actionContainer, question, data);
    } else {
        answerEl.push(actionContainer);
    }
    return answerEl;
}

function checkAnswer() {
    // TODO: Keep previous progress. if checkanswer remove all next
    var result;
    if (currentModel.checkAnswer) {
        // TODO: Implement model check answer with current question data
        result = currentModel.checkAnswer(currentQuestion);
        savedScores += result.score;
        maxScore += result.maxScore;
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
    var buttons = getFeedbackButtons(general),
        actionContainer = document.createElement('div');
        actionContainer.classList.add('feedback-actions');
        buttons.forEach(function (button) {
            actionContainer.appendChild(button);
        });
    if (model && model.getFeedback) {
        feedback = feedback.concat(
            model.getFeedback(result, actionContainer, general)
        );
    } else {
        feedback.push(actionContainer);
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
