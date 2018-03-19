/**

JS File that provides utilities for Smith University

**/
/*jslint nomen: true*/
/*jslint browser: true*/
/*global jQuery, console, Smith*/

(function ($) {
    'use strict';
    window.Smith = {
        isDev: true,
        path: '',
        init: function () {
            if (this.isDev) {
                this.path = 'http://localhost:4040/api/';
            } else {
                this.path = 'https://udev.smithbuy.com/api/';
            }
        },
        buildUrl: function (url) {
            return this.path + url;
        },
        call: function (settings, skipToken) {
            var vm = this;
            if (skipToken) {
                $.ajax(settings);
            } else {
                $.ajax({
                    method: 'POST',
                    url: vm.path + 'token',
                    dataType: 'json',
                    complete: function (res) {
                        settings.headers = {
                            Authorization: res.responseJSON.token_type + ' ' + res.responseJSON.access_token
                        };
                        $.ajax(settings);
                    }
                });
            }
        },
        getLeaderboard: function (callback, errorCallback) {
            var settings = {
                method: 'GET',
                url: this.buildUrl('leaderboard'),
                complete: callback,
                error: errorCallback || console.error,
                dataType: 'json'
            };
            this.call(settings, true);
        },
        getAssessment: function (id, callback, errorCallback) {
            if (id) {
                var settings = {
                    method: 'GET',
                    url: this.buildUrl('assessments/' + id + '/attempt'),
                    complete: callback,
                    error: errorCallback || console.error,
                    dataType: 'json'
                };
                this.call(settings);
            } else {
                console.error('Getting Assessment requires the assessment id.');
            }
        },
        /**
         * data {assessment_id, module_id, taker_id}
         */
        storeAttempt: function (data, callback, errorCallback) {
            if (data.assessment_id && data.module_id && data.taker_id) {
                var settings = {
                    type: 'POST',
                    url: this.buildUrl('attempts'),
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    complete: callback,
                    error: errorCallback || console.error
                };
                this.call(settings);
            } else {
                console.error('Attempts requires assessment id, module id and taker id');
            }
        },
        updateAttempt: function (id, data, callback, errorCallback) {
            var settings = {
                type: 'PATCH',
                url: this.buildUrl('attempts/' + id),
                dataType: 'json',
                contentType: 'application/json',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                complete: callback,
                error: errorCallback || console.error,
                data: JSON.stringify(data)
            };
            this.call(settings);
        },
        validateAssessment: function (data) {
            return data.Questions.filter(function (q) {
                if (q.questionType === 'Ordering') {
                    return q.answers.filter(function (a) {
                        return a.key;
                    }).length === 0;
                }
                return q.answers.filter(function (a) {
                    return a.scoreValue;
                }).length === 0;
            });
        }
    };

    $(window).ready(function () {
        Smith.init();
    });

}(jQuery));
