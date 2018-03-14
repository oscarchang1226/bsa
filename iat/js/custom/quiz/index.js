/**

IAT plugins

**/
/*jslint browser:true*/
/*global console, InlineQuizApp, CSVal, SMI, Smith, d2log, jQuery, alert */
(function ($, q, c, v, d) {
    'use strict';

    if (c) {
        try {
            c.init();
            c.user = {};
        } catch (e) {
            console.error(e);
        }
    }

    if (q) {
        /**
         * Transform response data to quiz data
        **/
        q.manipulateAttempts = true;
        q.attemptData = { questions: {} };
        q.waitFinishButtonText = 'Please wait as we generate your result...';
        q.finishButtonText = 'Finish Activity';
        q.onNoFeedbackGoEndSlideCallback = null;
        q.transformApiQuizData = function (data) {
            var result = {
                General: {
                    QuizName: (data.assessment.name || "Assessment") + '<span></span>',
                    CleanName: (data.assessment.name || "Assessment"),
                    feedBackType: (data.feedBackType || "continuous"),
                    forceCorrect: data.forceCorrect ? true : false,
                    maxTries: isNaN(data.maxTries) ? 0 : Number(data.maxTries),
                    tries: 0,
                    repeatOnComplete: true,
                    allowNone: false,
                    allowPrevious: false,
                    showHints: false,
                    allowPartial: true,
                    randomize: true,
                    subtractWrong: true,
                    postQuizText: 'You have completed this assessment.',
                    timer: data.assessment.timer_in_minutes,
                    percentage_to_pass: data.assessment.percentage_to_pass
                },
                Questions: data.questions.map(function (q) {
                    // Correct any flaws
                    var correctAnswers = q.answers.filter(function (a) {
                        return a.scoreValue;
                    });

                    // Correct quiz type names
                    if (q.questionType.toLowerCase() === 'fill in the blank') {
                        q.questionType = 'Fill In The Blank';
                    } else if (q.questionType.toLowerCase() === 'multiple select') {
                        q.questionType = 'All That Apply';
                    }

                    // Correct quiz answers
                    q.answers = q.answers.map(function (a) {
                        if (a.scoreValue) {
                            a.scoreValue = Number((q.maxScoreValue / correctAnswers.length).toFixed(2));
                            if (a.altAnswers) {
                                a.altAnswers = a.altAnswers.map(function (alt) {
                                    alt.scoreValue = a.scoreValue;
                                    return alt;
                                });
                            }
                        }
                        return a;
                    });

                    return q;
                })
            };
            if (data.assessment.name.toLowerCase().indexOf('quiz') > -1) {
                result.General.preQuizText = "<p>Take a few minutes to self-test what you have just learned before the end of this course. At the end of each course, you'll take a Final Test that covers all the material in the course. You need a 90% to pass, so practicing now will help you succeed. This self-study quiz is NOT graded and feedback is given immediately to help you understand mistakes.</p>";
            } else if (data.assessment.name.toLowerCase().indexOf('esd') > -1) {
                result.General.preQuizText = '<p>';
                result.General.preQuizText += '<br />This test consists of 24 multiple-choice questions. All questions are form the video: ESD Control (DVD-54C), which is available in the previous module. Each questions has only one <b>most</b> correct answer. Circle the letter corresponding to the your selection for each test item. You should read the question and all of the answers carefully before answering. <br />';
                result.General.preQuizText += '<br />If two answers appear to be correct, pick the answer that seems to be the most correct response. The passing grade for this test is a <b>70%</b> (17 or more correct answers). If you did not pass you may retake this test to improve your score. Your test will be automatically graded and you will know your results immediately. <br />';
                result.General.preQuizText += '<br /></p>';
                if (data.assessment.percentage_to_pass) {
                    result.General.preQuizText = result.General.preQuizText.replace('70%', data.assessment.percentage_to_pass + '%');
                }
                delete result.General.repeatOnComplete;
            } else if (data.assessment.name.toLowerCase().indexOf('test') > -1) {
                result.General.preQuizText = "<p>This is your Final Test for this course. Please make sure that you have reviewed the material in the videos and in the written portions of the course. Please also make sure that you have done the review quiz to practice the types of questions you may encounter in this Final Test.<br />";
                result.General.preQuizText += "<br />You will need to get a <b>100%</b> score on this Test to pass and earn credit (and a badge) for completing the course. If you pass the Test in your first attempt, you will earn five (5) points and a badge. Each attempt after the first, will deducted one point from the possible five for passing. These points add up in the <strongSmith U Leaderboard</strong>, which is a company-wide leaderboard based on individuals and on offices.<br/>";
                result.General.preQuizText += "<br />After you have passed all of the Tests for all of the graded courses in a series, you will take the Final Exam for the entire series. The Final Exam for this series is TR109: Final Exam.<br />";
                result.General.preQuizText += "<br />Good luck!</p>";
                if (data.assessment.percentage_to_pass) {
                    result.General.preQuizText = result.General.preQuizText.replace('100%', data.assessment.percentage_to_pass + '%');
                }
                delete result.General.repeatOnComplete;
            } else if (data.assessment.name.toLowerCase().indexOf('exam') > -1) {
                result.General.preQuizText = '<p>';
                result.General.preQuizText = 'This is your Final Exam for this series. Please make sure that you have done the review quizzes to practice the types of questions you may encounter! You must have a <b>85%</b> to pass the Exam and earn the Certificate, but you can attempt it multiple times (with point deductions).';
                result.General.preQuizText += '</p>';
                if (data.assessment.percentage_to_pass) {
                    result.General.preQuizText = result.General.preQuizText.replace('85%', data.assessment.percentage_to_pass + '%');
                }
                delete result.General.repeatOnComplete;
            }

            result.General.preQuizText += '<p>Press Start Activity to begin the assessment.</p>';
            return result;
        };

        q.setupQuizWithApi = function (elId, context) {
            var temp = location.search.replace('?', '').split('&');
            if (!context) {
                context = {};
                temp.forEach(function (t) {
                    context[t.split('=')[0]] = t.split('=')[1];
                });
            }
            if (!context.hasOwnProperty('assessmentId')) {
                d2log('ERROR: Missing Org Unit and Assessment Id');
                q.onSetupPlanB(elId, context);
            } else {
                if (c && c.user.Identifier) {
                    context.ui = c.user.Identifier;
                    context.taker_first = c.user.FirstName;
                    context.taker_last = c.user.LastName;
                    context.ou = c.context.ouID;
                    q.onSetup(elId, context);
                } else {
                    $.get(c.routes.get_whoami, function (data) {
                        if (data.Identifier) {
                            context.ui = data.Identifier;
                            context.taker_first = data.FirstName;
                            context.taker_last = data.LastName;
                            try {
                                context.ou = c.context.ouID;
                            } catch (e) {
                                context.ou = undefined;
                            }
                            if (context.ou) {
                                q.onSetup(elId, context);
                            } else {
                                d2log('Unable to continue without OrgUnit.');
                                alert('No Org Unit Id.');
                            }
                        } else {
                            q.onSetupPlanB(elId, context);
                        }
                    }).fail(function () {
                        q.onSetupPlanB(elId, context);
                    });
                }

            }
        };

        q.onSetupPlanB = function (elId, context) {
            if (!d.isDev) {
                alert('Can\'t retrieve user information.');
            }
            console.log('Unable to build quiz with', context, elId);
            // context.ui = 213;
            // context.ou = 7143;
            // context.taker_first = 'Oscar';
            // context.taker_last = 'Chang';
            // context.assessmentId = 60;
            // context.feedBackType = 'none';
            // context.forceCorrect = true;
            // context.maxTries = 3;
            // context.send_mail = 'oscarchang1226@gmail.com';
            q.onSetup(elId, context);
        };

        q.onSetup = function (elId, context) {
            v.init(context, function (c) {
                d.getAssessment(c.assessmentId, function (res) {
                    v.currentContext.assessmentId = res.responseJSON.assessment.id;
                    if (document.getElementById(elId) !== null) {
                        q.containerRef = document.getElementById(elId);
                        if (context.feedBackType) {
                            res.responseJSON.feedBackType = context.feedBackType;
                        }
                        if (context.forceCorrect) {
                            res.responseJSON.forceCorrect = context.forceCorrect;
                        }
                        if (context.maxTries) {
                            res.responseJSON.maxTries = context.maxTries;
                        }
                        q.QuizData = q.transformApiQuizData(res.responseJSON);
                        if (c.awardReceived) {
                            q.QuizData.Questions = [];
                            q.QuizData.General.preQuizText = '<p>Congratulations! You have passed ' + q.QuizData.General.CleanName + '.</p>';
                            q.isDisabled = true;
                        }
                        q.BuildQuiz(q.QuizData);
                    } else {
                        d2log('ERROR: Missing specified DOM object in InlineQuizApp.setupQuizWithApi().');
                    }
                });
            });
        };

        q.incrementTries = function () {
            q.QuizData.General.tries += 1;
        };

        q.resetTries = function () {
            q.QuizData.General.tries = 0;
        };

        q.noTriesLeft = function () {
            return q.QuizData.General.maxTries > 0 && q.QuizData.General.tries === q.QuizData.General.maxTries;
        };

        q.forceCorrectAndMaxTriesApplied = function () {
            return q.QuizData.General.forceCorrect && q.QuizData.General.maxTries;
        };

        q.onComplete = function (data) {
            q.QuizData.General.postQuizText += '<p>You scored <strong>' + (data.scoreAchieved / data.scoreMax * 100).toFixed(2) + '%</strong> (' + data.scoreAchieved + ' out of ' + data.scoreMax + ').</p>';
            if (q.reviews && Object.keys(q.reviews).length > 0) {
                q.QuizData.General.postQuizText += '<p><h4>Please review these topics: </h4><ul>';
                Object.keys(q.reviews).forEach(function (key) {
                    q.reviews[key].forEach(function (link) {
                        q.QuizData.General.postQuizText += '<li><a href="' + link.url + '" target="_blank">' + link.label + '</a></li>';
                    });
                });
                q.QuizData.General.postQuizText += '</ul></p>';
            }
        };

        q.onPostComplete = function () {
            q.updateTimer();
        };

        q.onNextTopic = function () {
            if (parent && parent.parent && parent.parent.document) {
                var nextButton = $('.d2l-page-header-side a.d2l-iterator-button-next', parent.parent.document);
                if (nextButton && nextButton.length === 1) {
                    nextButton[0].click();
                } else {
                    console.warn('Cannot find next button');
                }
            }
        };

        q.onReset = function () {
            $(q.containerRef).fadeOut(500);
            $(q.containerRef).empty();
            $(q.containerRef).fadeIn(500);
            q.setupQuizWithApi(q.containerRef.id);
        };

        q.onCheckAnswer = function (data) {
            if (q.forceCorrectAndMaxTriesApplied()) {
                q.incrementTries();
            }

            if (q.attemptData.questions[data.question.questionId]) {
                q.attemptData.questions[data.question.questionId].score = data.qScore;
                q.attemptData.questions[data.question.questionId].time += q.getTimeInSeconds();
            } else {
                q.attemptData.questions[data.question.questionId] = {
                    score: data.qScore,
                    time: q.getTimeInSeconds()
                };
            }
        };

        q.updateAttemptCallback = function (data) {
            if (data.responseJSON.reviews) {
                q.reviews = data.responseJSON.reviews;
            }
            if (q.QuizData.General.feedBackType === 'continuous') {
                q.enableAccessFeedbackButton();
                q.editFeedbackButtonText(q.finishButtonText);
            } else {
                q.onNoFeedbackGoEndSlideCallback();
            }
        };

        q.storeAssessmentData = function () {
            var percentage = 0,
                temp;
            if (q.GetMaxScore() > 0) {
                percentage = q.GetTotalScore() / q.GetMaxScore() * 100;
            }
            q.stopTimer();
            if (v.currentContext.inClassList) {
                if (q.manipulateAttempts) {
                    if (v.currentContext.send_mail) {
                        q.attemptData.send_mail = v.currentContext.send_mail;
                    }
                    d.updateAttempt(v.currentContext.attempt_id, q.attemptData, q.updateAttemptCallback);
                } else {
                    if (q.QuizData.General.feedBackType === 'continuous') {
                        q.enableAccessFeedbackButton();
                        q.editFeedbackButtonText(q.finishButtonText);
                    } else {
                        q.onNoFeedbackGoEndSlideCallback();
                    }
                }
                if (percentage >= q.QuizData.General.percentage_to_pass) {
                    if (v.currentContext.awardId) {
                        temp = v.generateIssuedAwardCreate(
                            'Passed assessment (' + v.currentContext.assessmentId + ') ' + q.QuizData.General.CleanName,
                            'Percentage: ' + percentage.toFixed(2) + '% for ' + q.QuizData.General.percentage_to_pass + '%'
                        );
                        v.issueAward(null, temp);
                    }
                }
            } else {
                if (q.QuizData.General.feedBackType === 'continuous') {
                    q.enableAccessFeedbackButton();
                    q.editFeedbackButtonText(q.finishButtonText);
                } else {
                    q.onNoFeedbackGoEndSlideCallback();
                }
            }
        };

        q.postCheckAnswer = function (nextQuestionFlag) {
            if (parent && $('#assessment-frame', parent.document)) {
                $('#assessment-frame', parent.document).height($('body').height());
            }

            if (q.QuizData.General.forceCorrect) {
                if (nextQuestionFlag) {
                    q.currentQuestion += 1;

                    if (q.currentQuestion < q.QuizData.General.showQuestions) {
                        q.currentQuestionID = q.QuizData.Questions[q.currentQuestion].QuestionID;
                    } else {
                        q.storeAssessmentData();
                    }
                    q.GoNextQuestion();
                }
            } else {
                if (q.currentQuestion === q.QuizData.General.showQuestions - 1) {
                    q.storeAssessmentData();
                }
            }
        };

        q.onReady = function (data) {
            if (data.quizData.General.timer) {
                q.QuizData.General.timer = data.quizData.General.timer * 60;
                q.timer = {
                    m: Math.floor(q.QuizData.General.timer / 60),
                    s: q.QuizData.General.timer % 60
                };
                q.updateTimer();
            } else {
                q.timer = {
                    s: 0
                };
            }
        };

        q.onStart = function () {
            delete q.reviews;
            if (v.currentContext.inClassList) {
                if (q.manipulateAttempts) {
                    return d.storeAttempt({
                        taker_id: v.currentContext.ui,
                        taker_first: v.currentContext.taker_first,
                        taker_last: v.currentContext.taker_last,
                        module_id: v.currentContext.ou,
                        assessment_id: v.currentContext.assessmentId
                    }, function (res) {
                        v.currentContext.attempt_id = res.responseJSON.id;
                        q.startTimer();
                        q.GoNextQuestion();
                    });
                }
            }
            q.startTimer();
            q.GoNextQuestion();
        };

        q.getTimeInSeconds = function () {
            var currentTime,
                temp;
            if (q.QuizData.General.timer) {
                currentTime = q.timer.m * 60 + q.timer.s;
                Object.keys(q.attemptData.questions).reduce(function (acc, qId) {
                    return acc + q.attemptData.questions[qId].time;
                }, 0);
                return q.QuizData.General.timer - currentTime - Object.keys(q.attemptData.questions).reduce(function (acc, qId) { return acc + q.attemptData.questions[qId].time; }, 0);
            }
            if (q.timer.interval) {
                temp = q.timer.s;
                q.timer.s = 0;
                return temp;
            }
            return 0;
        };

        q.updateTimer = function (s) {
            if (q.QuizData.General.timer) {
                $('#ILQ_header h1').css({'position': 'relative'});
                $('#ILQ_header h1 span').css({'position': 'absolute', 'right': '5pt'});
                $('#ILQ_header h1 span').html(s || q.formatTimer(q.timer));
            }
        };

        q.formatTimer = function (obj) {
            var a = obj.m > 9 ? String(obj.m) : '0' + obj.m,
                b = obj.s > 9 ? String(obj.s) : '0' + obj.s;
            return a + ':' + b;
        };

        q.decrementTimer = function () {
            if (q.QuizData.General.timer && q.timer.s > -1) {
                q.timer.s -= 1;
                if (q.timer.s < 0) {
                    q.timer.m -= 1;
                    if (q.timer.m < 0) {
                        // Times up
                        console.log('Times up');
                    } else {
                        q.timer.s = 59;
                    }
                }
            }
        };

        q.startTimer = function () {
            if (q.QuizData.General.timer && !q.timer.interval) {
                q.timer.interval = setInterval(function () {
                    if (q.timer.s === 0 && q.timer.m === 0) {
                        q.attemptData.questions[q.QuizData.Questions[q.currentQuestion].questionId] = {
                            score: 0,
                            time: q.getTimeInSeconds()
                        };
                        q.currentQuestion = q.QuizData.General.showQuestions;
                        q.QuizData.General.postQuizText = '<p>Time\'s up!</p>';
                        q.stopTimer();
                        q.storeAssessmentData();
                        q.updateTimer('00:00');
                        q.goEndSlide();
                    } else {
                        q.decrementTimer();
                        q.updateTimer();
                    }
                },
                    1000
                    );
            } else {
                q.timer.s = 0;
                q.timer.interval = setInterval(function () {
                    q.timer.s += 1;
                }, 1000);
            }
        };

        q.stopTimer = function () {
            if (q.QuizData.General.timer && q.timer.interval) {
                clearInterval(q.timer.interval);
            } else if (q.timer.interval) {
                clearInterval(q.timer.interval);
            }
        };

        q.accessFeedbackButtonOnOK = function () {
            var btnTxt = $('ILQ_GenericLabel').attr('data-label'),
                i;
            if (btnTxt === 'Reset Activity') {
                if (q.QuizData.General.randomize) {
                    q.QuizData.Questions = q.shuffle(q.QuizData.Questions);
                }

                q.currentQuestion = 0;
                q.currentQuestionID = q.QuizData.Questions[q.currentQuestion].QuestionID;

                // Resets the chosen answers for all types of questions, so they can't be used to repopulate fields on restart
                for (i = q.QuizData.Questions.length - 1; q >= 0; q -= 1) {
                    q.QuizData.Questions[i].QuestionID = i;
                    q.QuizData.Questions[i].ChosenAnswers = [];
                }

                q.savedText = [];

                for (i = 0; i < q.QuizData.Questions.length; i += 1) {
                    q.savedText.push(0);
                }

                q.GoNextQuestion();
            } else {
                q.currentQuestion += 1;

                if (q.currentQuestion < q.QuizData.General.showQuestions) {
                    q.currentQuestionID = q.QuizData.Questions[q.currentQuestion].QuestionID;
                }

                q.GoNextQuestion();
            }
        };

        q.enableAccessFeedbackButton = function () {
            var buttonContainer = $('.ILQ_GenericButtonContainer.Generic');
            buttonContainer.removeClass('ILQ_GenericButtonDisabled');

            buttonContainer.on('mouseover focus', function () {
                $(this).addClass('over');
            });

            buttonContainer.on('mouseout blur', function () {
                $(this).removeClass('over');
            });

            buttonContainer.on('mousedown', function () {
                $(this).addClass('active');
            });

            buttonContainer.on('keydown', function (e) {
                if (e.keyCode === 13 || e.keyCode === 32) {
                    q.accessFeedbackButtonOnOK(e);
                }
            });

            buttonContainer.on('click', q.accessFeedbackButtonOnOK);
        };

        q.editFeedbackButtonText = function (text) {
            if (!q.QuizData.General.forceCorrect) {
                var buttonContainer = $('.ILQ_GenericButtonContainer.Generic'),
                    temp = buttonContainer.html();
                buttonContainer.html(temp.replace(new RegExp(q.waitFinishButtonText, 'g'), text));
            }
        };

        q.onSelectChange = function () {
            var elName = $(this).attr('name'),
                temp = {},
                k;
            if (!InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].OrderingAnswers) {
                InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].OrderingAnswers = {};
            }
            temp = InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].OrderingAnswers;
            $('option[disabled]').attr('disabled', null);
            if ($(this).val()) {
                temp[elName] = $(this).val();
            } else {
                delete temp[elName];
            }
            for (k in temp) {
                if (temp.hasOwnProperty(k)) {
                    $('option[value=' + Number(temp[k]) + ']').attr('disabled', 'true');
                }
            }
            InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].OrderingAnswers = temp;
            if (Object.keys(temp).length === InlineQuizApp.QuizData.Questions[InlineQuizApp.currentQuestion].answers.length) {
                $('#ILQ_quizNextBtn').removeClass('ILQ_BaseButtonDisabled');
                $('#ILQ_quizNextBtn').attr('role', 'button');
                $('#ILQ_quizNextBtn').removeAttr('disabled');
                $('#ILQ_quizNextBtn').fadeIn(500);
                $('#ILQ_quizNextBtn .ILQ_AccessOnly').css('display', 'none');
                $('#ILQ_quizNextBtn .ILQ_AccessOnly').attr('aria-hidden', 'true');
                $('#ILQ_quizNextBtn')[0].onclick = InlineQuizApp.RequestNextQuestion;
                $('#ILQ_quizNextBtn')[0].onmouseover = function () {
                    $(this).addClass('over');
                };
                $('#ILQ_quizNextBtn')[0].onmouseout = function () {
                    $(this).removeClass('over');
                };
                $('#ILQ_quizNextBtn')[0].onfocus = function () {
                    $(this).addClass('over');
                };
                $('#ILQ_quizNextBtn')[0].onblur = function () {
                    $(this).removeClass('over');
                };
                $('#ILQ_quizNextBtn')[0].onkeypress = function (e) {
                    if (e.keyCode === 13 || e.keyCode === 32) {
                        InlineQuizApp.RequestNextQuestion(e);
                    }
                };
            } else {
                $('#ILQ_quizNextBtn').addClass('ILQ_BaseButtonDisabled');
                $('#ILQ_quizNextBtn').attr('role', 'disabled');
                $('#ILQ_quizNextBtn').fadeOut(250);
                $('#ILQ_quizNextBtn .ILQ_AccessOnly').css('display', 'inline');
                $('#ILQ_quizNextBtn .ILQ_AccessOnly').attr('aria-hidden', 'false');
                $('#ILQ_quizNextBtn')[0].onclick = undefined;
                $('#ILQ_quizNextBtn')[0].onmouseover = undefined;
                $('#ILQ_quizNextBtn')[0].onmouseout = undefined;
                $('#ILQ_quizNextBtn')[0].onfocus = undefined;
                $('#ILQ_quizNextBtn')[0].onblur = undefined;
                $('#ILQ_quizNextBtn')[0].onkeypress = undefined;
            }
        };

        q.onNoFeedbackGoEndSlide = function (callback) {
            $('#ILQ_quizNextBtn').addClass('ILQ_BaseButtonDisabled');
            $('#ILQ_quizNextBtn').attr('role', 'disabled');
            $('#ILQ_quizNextBtn .ILQ_AccessOnly').css('display', 'inline');
            $('#ILQ_quizNextBtn .ILQ_AccessOnly').attr('aria-hidden', 'false');
            $('#ILQ_quizNextBtn')[0].onclick = undefined;
            $('#ILQ_quizNextBtn')[0].onmouseover = undefined;
            $('#ILQ_quizNextBtn')[0].onmouseout = undefined;
            $('#ILQ_quizNextBtn')[0].onfocus = undefined;
            $('#ILQ_quizNextBtn')[0].onblur = undefined;
            $('#ILQ_quizNextBtn')[0].onkeypress = undefined;
            q.editNextButtonText(q.waitFinishButtonText);
            q.onNoFeedbackGoEndSlideCallback = callback;
            q.storeAssessmentData();
        };

        q.editNextButtonText = function (text) {
            var buttonLabelContainer = $('#ILQ_quizNextBtn .ILQ_BaseButtonLabel'),
                temp = buttonLabelContainer.html();
            buttonLabelContainer.html(temp.replace(new RegExp('Continue', 'g'), text));
        };

    }
}(jQuery, InlineQuizApp, CSVal, SMI, Smith));
