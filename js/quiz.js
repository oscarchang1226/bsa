/*jslint browser: true*/
/*global $, jQuery, CSVal, console */

var $ = jQuery,
    CSVal = CSVal || {},
    savedActivity = [],
    savedScores = [],
    savedMaxScore = [],
    currentIndex = 0,
    gradedScoreObject = {},
    gradeObject = {},
    currentModel = null,
    currentQuestion = null,
    quizData = {},
    SELECTORS = {
        header: '.header',
        content: '.content',
        feedbacks: '.feedbacks',
        actions: '.actions'
    },
    ICON_NAMES = {
        correct: 'done',
        wrong: 'clear',
        partial: 'timelapse'
    },
    BUTTONS = {
        startQuiz: {
            label: 'Start',
            className: 'start-quiz'
        },
        finish: {
            label: 'Submit Grade',
            className: 'finish'
        },
        resetAll: {
            label: 'Reset',
            className: 'reset'
        },
        checkAnswer: {
            label: 'Submit',
            className: 'submit'
        },
        hint: {
            label: 'Hint',
            className: 'hint'
        },
        previous: {
            label: 'Back',
            className: 'back'
        },
        cont: {
            label: 'Next',
            className: 'next'
        },
        endQuiz: {
            label: 'Next',
            className: 'end-quiz'
        }
    },
    ou,
    ui;

// try {
//     CSVal.init();
// } catch (e) {
//     console.error('Valence not initiated', e);
// }
$.getJSON('data/api-dummy.json', function (data) {
    CSVal = data;
});

function setUserContext() {
    SMI.whoAmI(function (d) {
        ui = d.Identifier;
    });
}

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
            repopulateContainer(SELECTORS.actions, getQuizButtons(quizData));
        } else {
            // TODO: Notification question model not found
            console.error('No Model of '+ currentQuestion.questionType);
        }
    }
}

function startQuiz(i) {
    initialSaved();
    if (!i || i instanceof Event) {
        i = 0;
    }
    currentIndex = i;
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
    if (elList.length === 0) {
        elList.push(getText('Click <b>Start</b> to begin your quiz.', 'quiz-instructions'));
    }
    if (gradedScoreObject.DisplayedGrade && gradedScoreObject.PointsNumerator) {
        elList.push(getText('You scored <b>' + gradedScoreObject.DisplayedGrade + '</b> your previous attempt.', 'graded-text'));
    }
    return elList;
}

function getPostQuiz(data, containerParent) {
    var text,
        medias,
        elList = [];
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
        repopulateContainer(SELECTORS.actions, getPostQuizButtons());
    } else {
        finish();
    }
}

function finish() {
    var score = savedScores.reduce(function (acc, score) {
            return acc + score;
        }, 0),
        maxScore = savedMaxScore.reduce(function (acc, score) {
            return acc + score;
        }, 0),
        submitCallBack = function (e) {
            'use strict';
            if (this !== e.target) {
                return;
            }
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
                    cb = function (res, err) {
                        if (res.status === 200) {
                            closeDialog();
                            return parent.document.querySelector('a.d2l-iterator-button-next').click();
                        } else {
                            console.error(res.statusText, err);
                        }
                    };
                if (nextButton) {
                    SMI.putUserGrade(ou, quizData.General.gradeId, ui, incomingGradeValue, cb);
                } else {
                    // TODO: Maybe use a dialog for this
                    console.warn('Cannot find next button');
                    console.log(incomingGradeValue);
                }
            } else {
                // TODO: Maybe use a dialog for this
                console.warn('Cannot find next button');
                console.log(incomingGradeValue);
            }
        },
        content = document.createElement('div'),
        actions = document.createElement('div'),
        temp;
    content.appendChild(getText('You scored <b>' + score + ' out of ' + maxScore + '</b>.', 'graded-text'));
    content.appendChild(getText('Submit your scores?', ''));
    temp = document.createElement('button');
    temp.classList.add('y');
    temp.appendChild(document.createTextNode('Yes'));
    temp.addEventListener('click', submitCallBack);
    actions.appendChild(temp);
    temp = document.createElement('button');
    temp.classList.add('n');
    temp.appendChild(document.createTextNode('No'));
    temp.addEventListener('click', closeDialog);
    actions.appendChild(temp);
    showDialog('Quiz Result', content, actions);
}

/**
    Button Providers
*/

function getPreQuizButtons() {
    return [getButtonElement(BUTTONS.startQuiz)];
}

function getPostQuizButtons() {
    var temp = BUTTONS.startQuiz;
    temp.label = 'Restart';
    return [getButtonElement(temp), getButtonElement(BUTTONS.finish)];
}

function getQuizButtons(data) {
    var buttons = [],
        temp;
    if (currentIndex > 0 && data.General.allowPrevious) {
        buttons.push(getButtonElement(BUTTONS.previous));
    }
    if (savedActivity[currentIndex] || savedScores[currentIndex] !== null) {
        if (currentIndex === data.Questions.length-1) {
            if (havePostQuiz(data)) {
                if (data.General.allowReset || currentQuestion.reset) {
                    buttons.push(getButtonElement(BUTTONS.resetAll));
                }
                buttons.push(getButtonElement(BUTTONS.endQuiz));
            } else {
                temp = BUTTONS.startQuiz;
                temp.label = 'Restart';
                buttons.push(getButtonElement(temp));
                buttons.push(getButtonElement(BUTTONS.finish));
            }
        } else {
            if (data.General.allowReset || currentQuestion.reset) {
                buttons.push(getButtonElement(BUTTONS.resetAll));
            }
            buttons.push(getButtonElement(BUTTONS.cont));
        }
    } else {
        if (data.General.allowReset || currentQuestion.reset) {
            buttons.push(getButtonElement(BUTTONS.resetAll));
        }
        if (data.General.showHints &&
            ((currentQuestion.hintText && currentQuestion.hintText.toUpperCase() !== 'NONE') ||
            (currentQuestion.hintMedia && currentQuestion.hintMedia.toUpperCase() !== 'NONE'))
        ) {
            buttons.push(getButtonElement(BUTTONS.hint));
        }
        buttons.push(getButtonElement(BUTTONS.checkAnswer));
    }
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
    document.querySelectorAll('div.answer-actions button, div.feedback-actions button, div.actions button').forEach(function (b) {
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
    var tag = 'h'+ (data.General.HeadingLevel || 1),
        el = document.createElement(tag);
    el.appendChild(document.createTextNode(data.General.QuizName || 'Quiz'));
    return el;
}

function setQuizHeader(el) {
    $('header').empty().append(el);
}

function initialSaved() {
    savedActivity = [], savedScores = [], savedMaxScore = [];
    quizData.Questions.forEach(
        function () {
            savedActivity.push(null);
            savedScores.push(null);
            savedMaxScore.push(null);
        }
    );
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
        SMI.getGrade(ou, quizData.General.gradeId, function (res) {
            if (res.status === 200) {
                gradeObject = res.responseJSON;
            }
        });
        var quizHeader = getQuizHeader(quizData);
        setQuizHeader(quizHeader);
        var callback = function (d) {
            'use strict';
            if (d.status === 200) {
                gradedScoreObject = d.responseJSON;
            }
            var preQuiz = getPreQuiz(quizData);
            var preQuizButtons = getPreQuizButtons();
            repopulateContainer(SELECTORS.content, preQuiz);
            repopulateContainer(SELECTORS.actions, preQuizButtons);
        }
        SMI.getUserGrade(ou, quizData.General.gradeId, ui, callback);
    });
}

function getAnswer(model, data, question) {
    var answerEl = [];
    if (model.getAnswer) {
        answerEl = model.getAnswer(question, data);
    }
    return answerEl;
}

function checkAnswer() {
    // TODO: Keep previous progress. if checkanswer remove all next
    var result;
    if (currentModel.checkAnswer) {
        // TODO: Implement model check answer with current question data
        result = currentModel.checkAnswer(currentQuestion);
        savedScores[currentIndex] = result.score;
        if (!savedMaxScore[currentIndex]) {
            savedMaxScore[currentIndex] = result.maxScore;
        }
        var feedbackEl = getFeedback(currentModel, quizData, result);
        repopulateContainer(SELECTORS.feedbacks, feedbackEl);
        repopulateContainer(SELECTORS.actions, getQuizButtons(quizData));
    } else {
        // TODO: proceed with default checking
        console.error('No default checking.');
    }
}

function getHint() {
    var text = getText(currentQuestion.hintText, 'hint-text'),
        medias = getHintMedia(currentQuestion.hintMedia),
        content = document.createElement('div');
    content.appendChild(text);
    medias.forEach(function (m) {
        content.appendChild(m);
    });
    showDialog('Hint', content);
}

function createDialog(title, content, actions) {
    var backdrop = document.createElement('div'),
        header = document.createElement('div'),
        closeIcon = getIcon(ICON_NAMES.wrong),
        dialog = document.createElement('div'),
        temp = document.createElement('div');
    if (!(content instanceof HTMLElement)) {
        temp.innerHTML = content;
        content = temp;
    }
    backdrop.classList.add('dialog-backdrop');
    header.classList.add('dialog-header');
    content.classList.add('dialog-content');
    closeIcon.classList.add('close-dialog-button');
    dialog.classList.add('dialog');

    temp = document.createElement('span');
    temp.appendChild(document.createTextNode(title));
    header.appendChild(temp);

    closeIcon.addEventListener('click', closeDialog);
    backdrop.addEventListener('click', closeDialog);

    header.appendChild(closeIcon);
    dialog.appendChild(header);
    dialog.appendChild(content);

    if (actions instanceof HTMLElement) {
        actions.classList.add('dialog-actions');
        dialog.appendChild(actions);
    }

    backdrop.appendChild(dialog);

    return backdrop;
}

function showDialog(title, content, actions) {
    var dialog = createDialog(title, content, actions);
    // remove existing dialog
    if (document.querySelector('.dialog-backdrop')) {
        document.querySelector('.dialog-backdrop').remove();
    }
    document.querySelector('main').appendChild(dialog);
}

function closeDialog(e) {
    // prevent nested elements from invoking the handler
    if (e instanceof Event) {
        if (this != e.target) {
            return;
        }
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
    savedActivity[currentIndex] = null;
    savedScores[currentIndex] = null;
    getQuiz(currentIndex);
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
    var title = 'Question ' + (currentIndex + 1) + ' of ' + general.Questions.length,
        questionTitle = document.createElement('h2'),
        elList;
    questionTitle.appendChild(document.createTextNode(title));
    questionTitle.classList.add('question-title');
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
    title.appendChild(document.createTextNode('Result '));
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
            model.getFeedback(result, general)
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

/**
    Events
**/
function onChange(e) {
    if (currentModel.onChange) {
        currentModel.onChange(e);
    }
}
