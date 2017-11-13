/**

IAT plugins

**/
/*jslint browser:true*/
/*global console, InlineQuizApp, CSVal, SMI, Smith, d2log, jQuery */
(function ($, q, c, v, d) {
    'use strict';

    if (c && !c.user) {
        try {
            // c.init();
            c.user = {};
        } catch (e) {
            console.error(e);
        }
    }

    if (q) {
        /**
         * Transform response data to quiz data
        **/
        q.manipulateAttempts = false;
        q.attemptData = { questions: {} };
        q.transformApiQuizData = function (data) {
            var result = {
                "General": {
                    "QuizName": (data.assessment.name || "Assessment") + '<span></span>',
                    "feedBackType": "continuous",
                    "forceCorrect": false,
                    "repeatOnComplete": true,
                    "allowNone": false,
                    "allowPrevious": false,
                    "showHints": false,
                    "allowPartial": true,
                    "randomize": true,
                    "subtractWrong": true,
                    "postQuizText": 'You have completed this assessment.',
                    "timer": data.assessment.timer_in_minutes
                },
                'Questions': data.questions.map(function (q) {
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
                        }
                        return a;
                    });

                    return q;
                })
            };
            if (data.assessment.name.toLowerCase().indexOf('quiz') > -1) {
                result.General.preQuizText = "<p>Take a few minutes to self-test what you have just learned before the end of this course. At the end of each course, you'll take a Final Test that covers all the material in the course. You need a 100% to pass, so practicing now will help you succeed. This self-study quiz is NOT graded and feedback is given immediately to help you understand mistakes.</p>";
            } else if (data.assessment.name.toLowerCase().indexOf('test') > -1) {
                result.General.preQuizText = "<p>This is your Final Test for this course. Please make sure that you have reviewed the material in the videos and in the written portions of the course. Please also make sure that you have done the review quiz to practice the types of questions you may encounter in this Final Test.<br />";
                result.General.preQuizText += "<br />You will need to get a <b>100%</b> score on this Test to pass and earn credit (and a badge) for completing the course. If you pass the Test in your first attempt, you will earn five (5) points and a badge. Each attempt after the first, will deducted one point from the possible five for passing. These points add up in the <strongSmith U Leaderboard</strong>, which is a company-wide leaderboard based on individuals and on offices.<br/>";
                result.General.preQuizText += "<br />After you have passed all of the Tests for all of the graded courses in a series, you will take the Final Exam for the entire series. The Final Exam for this series is TR109: Final Exam.<br />";
                result.General.preQuizText += "<br />Good luck!</p>";
                if (data.assessment.percentage_to_pass) {
                    result.General.preQuizText = result.General.preQuizText.replace('100%', data.assessment.percentage_to_pass + '%');
                }
                delete result.General.repeatOnComplete;
            }

            result.General.preQuizText += '<p>Press Start Activity to begin the assessment.</p>';
            return result;
        };

        q.setupQuizWithApi = function (elId) {
            var temp = location.search.replace('?', '').split('&'),
                context = {},
                vm = this;
            temp.forEach(function (t) {
                context[t.split('=')[0]] = t.split('=')[1];
            });
            if (CSVal && CSVal.user.Identifier) {
                context.ui = CSVal.user.Identifier;
                context.taker_first = CSVal.user.FirstName;
                context.taker_last = CSVal.user.LastName;
            } else {
                context.ui = 221;
                context.taker_first = 'Oscar';
                context.taker_last = 'Chang';
            }
            v.init(context);
            d.getAssessment(context.assessmentId, function (res) {
                v.currentContext.assessmentId = res.responseJSON.assessment.id;
                if (document.getElementById(elId) !== null) {
                    vm.containerRef = document.getElementById(elId);
                    vm.QuizData = vm.transformApiQuizData(res.responseJSON);
                    vm.BuildQuiz(vm.QuizData);
                } else {
                    d2log('ERROR: Missing specified DOM object in InlineQuizApp.setupQuizWithApi().');
                }
            });
        };

        q.onComplete = function (data) {
            /**
                data    scoreAchieved
                        scoreMax
                        quizData
            **/
            q.QuizData.General.postQuizText += '<p>You scored <strong>' + (data.scoreAchieved / data.scoreMax * 100).toFixed(2) + '%</strong> (' + data.scoreAchieved + ' out of ' + data.scoreMax + ').</p>';
        };

        q.onPostComplete = function () {
            q.updateTimer();
        };

        q.onNextTopic = function () {
            if (parent && parent.document) {
                var nextButton = parent.document.querySelector('a.d2l-iterator-button-next');
                if (nextButton) {
                    parent.document.querySelector('a.d2l-iterator-button-next').click();
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
            q.attemptData.questions[data.question.questionId] = {
                score: data.qScore,
                time: q.getTimeInSeconds()
            };
            if (q.currentQuestion === q.QuizData.General.showQuestions - 1) {
                q.stopTimer();
                if (q.manipulateAttempts) {
                    d.updateAttempt(v.currentContext.attempt_id, q.attemptData, function () {
                        console.log('update grade, issue award', v.currentContext.gi, v.currentContext.ai);
                    });
                }
            }
        };

        q.onReady = function (data) {
            // console.log(data.quizData.General.timer);
            if (data.quizData.General.timer) {
                q.QuizData.General.timer = data.quizData.General.timer * 60;
                q.timer = {
                    m: Math.floor(q.QuizData.General.timer / 60),
                    s: q.QuizData.General.timer % 60
                };
                q.updateTimer();
            }
        };

        q.onStart = function () {
            if (q.manipulateAttempts) {
                d.storeAttempt({
                    taker_id: v.currentContext.ui,
                    taker_first: v.currentContext.taker_first,
                    taker_last: v.currentContext.taker_last,
                    module_id: v.currentContext.ou,
                    assessment_id: v.currentContext.assessmentId
                }, function (res) {
                    v.currentContext.attempt_id = res.responseJSON.id;
                    q.GoNextQuestion();
                });
            }
            q.startTimer();
            q.GoNextQuestion();
        };

        q.getTimeInSeconds = function () {
            var currentTime = q.timer.m * 60 + q.timer.s;
            Object.keys(q.attemptData.questions).reduce(function (acc, qId) {
                return acc + q.attemptData.questions[qId].time;
            }, 0);
            return q.QuizData.General.timer - currentTime - Object.keys(q.attemptData.questions).reduce(function (acc, qId) { return acc + q.attemptData.questions[qId].time; }, 0);
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
                        // endQuiz();
                        // currentIndex = quizData.Questions.length-1;
                        q.currentQuestion = q.QuizData.General.showQuestions;
                        q.QuizData.General.postQuizText = '<p>Time\'s up!</p>';
                        q.stopTimer();
                        q.updateTimer('00:00');
                        q.goEndSlide();
                    } else {
                        q.decrementTimer();
                        q.updateTimer();
                    }
                },
                    1000
                    );
            }
        };

        q.stopTimer = function () {
            if (q.timer.interval) {
                clearInterval(q.timer.interval);
            }
        };
    }
}(jQuery, InlineQuizApp, CSVal, SMI, Smith));
