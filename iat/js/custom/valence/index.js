/*
 * Smith and Associates package, js api.
 *
 * Copyright (c) 2017 N.F. Smith & Associates
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/*
 * This file provides services for Valence Learning Framework API.
 */

/*jslint browser: true */
/*global D2L, jQuery, $, console, SMI */
(function ($) {
    "use strict";
    window.SMI = {
        LEVERSION: '1.25',
        BAVERSION: '1.0',
        LPVERSION: '1.18',
        currentContext: {},
        init: function (currentContext, cb) {
            var vm = this;
            vm.currentContext = currentContext;
            try {
                if (vm.currentContext.ou && vm.currentContext.awardId) {
                    vm.getUserAwards(function (res) {
                        if (res.responseJSON.Objects && res.responseJSON.Objects.length > 0) {
                            vm.currentContext.awardReceived = res.responseJSON.Objects.filter(function (obj) {
                                return Number(obj.OrgUnitId) === Number(vm.currentContext.ou) &&
                                    Number(obj.Award.AwardId) === Number(vm.currentContext.awardId);
                            }).length > 0;
                        }
                        if (cb && cb.constructor === Function) {
                            cb(vm.currentContext);
                        }
                    });
                    vm.getClassList(function (res) {
                        vm.currentContext.inClassList = res.responseJSON.filter(function (obj) {
                            return Number(obj.Identifier) === Number(vm.currentContext.ui);
                        }).length > 0;
                    });
                } else {
                    if (cb && cb.constructor === Function) {
                        cb(vm.currentContext);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        },
        getUrls: function (name) {
            var urls = {
                user_grade: '/d2l/api/le/' + this.LEVERSION + '/' + this.currentContext.ou + '/grades/' + this.currentContext.gi + '/values/' + this.currentContext.ui,
                grade: '/d2l/api/le/' + this.LEVERSION + '/' + this.currentContext.ou + '/grades/' + this.currentContext.gi,
                grade_stats: '/d2l/api/le/' + this.LEVERSION + '/' + this.currentContext.ou + '/grades/' + this.currentContext.gi + '/statistics',
                associations: '/d2l/api/bas/' + this.BAVERSION + '/orgunits/' + this.currentContext.ou + '/associations/',
                issue_award: '/d2l/api/bas/' + this.BAVERSION + '/orgunits/' + this.currentContext.ou + '/issued/',
                user_awards: '/d2l/api/bas/' + this.BAVERSION + '/issued/users/' + this.currentContext.ui + '/',
                class_list: '/d2l/api/le/' + this.LEVERSION + '/' + this.currentContext.ou + '/classlist/',
                who_am_i: '/d2l/api/lp/' + this.LPVERSION + '/users/whoami'
            };
            return urls[name];
        },
        getAppContext: function () {
            var a = 'Bocs5Yg-9rEpxK_0L4dGUw',
                b = 'zEoByoY5l3sWLvBkwXAmcA';
            return new D2L.ApplicationContext(a, b);
        },
        getUserContext: function () {
            var c = 'https://smithweb.brightspace.com',
                d = '443',
                e = 'e9RfZgHDTu3vm_gqMPsmfC',
                f = 'DphdEgK0jpS_8P-ZXaZQWR';
            return this.getAppContext().createUserContextWithValues(c, d, e, f);
        },
        preCall: function (cb) {
            if (this.currentContext.prod) {
                $.get('/d2l/lp/auth/xsrf-tokens', cb);
            } else {
                cb({'hitCodePrefix': '-1315665569', 'referrerToken': 'Znpl0OTAb63pYv88SK92DaKkwZsArud9'});
            }
        },
        callAjax: function (m, u, cb, data) {
            if (typeof cb !== 'function') {
                cb = function (res, err) {
                    if (res.status !== 200) {
                        console.error(res.statusText, err);
                    }
                };
            }
            u = this.getUserContext().createUrlForAuthentication(u, m);
            var preCallback = function (d) {
                var settings = {
                    type: m,
                    url: u,
                    complete: cb,
                    headers: {
                        'X-Csrf-Token': d.referrerToken
                    }
                };
                if ('POST' === m.toUpperCase() || 'PUT' === m.toUpperCase()) {
                    settings.dataType = 'json';
                    settings.contentType = "application/json";
                    settings.data = JSON.stringify(data);
                    settings.headers.Accept = 'application/json';
                    settings.headers['Content-Type'] = 'application/json';
                }
                $.ajax(settings);
            };
            return this.preCall(preCallback);
        },
        getAssociations: function (cb) {
            var url = this.getUrls('associations');
            return this.callAjax('GET', url, cb);
        },
        issueAward: function (cb, data) {
            var url = this.getUrls('issue_award');
            if (data && data.hasOwnProperty('AwardId')
                    && data.hasOwnProperty('IssuedToUserId')
                    && data.hasOwnProperty('Criteria')
                    && data.hasOwnProperty('Evidence')) {
                return this.callAjax('POST', url, cb, data);
            }
            console.error('Data needs the following property: AwardId, IssuedToUserId, Criteria, Evidence.');
        },
        getUserAwards: function (cb) {
            var url = this.getUrls('user_awards');
            return this.callAjax('GET', url, cb);
        },
        getGrade: function (cb) {
            var url = this.getUrls('grade');
            return this.callAjax('GET', url, cb);
        },
        getGradeStats: function (cb) {
            var url = this.getUrls('grade_stats');
            return this.callAjax('GET', url, cb);
        },
        getUserGrade: function (cb) {
            var url = this.getUrls('user_grade');
            return this.callAjax('GET', url, cb);
        },
        getClassList: function (cb) {
            var url = this.getUrls('class_list');
            return this.callAjax('GET', url, cb);
        },
        putUserGrade: function (cb, data) {
            var url = this.getUrls('user_grade');
            return this.callAjax('PUT', url, cb, data);
        },
        generateIssuedAwardCreate: function (c, e) {
            return {
                AwardId: this.currentContext.awardId,
                IssuedToUserId: this.currentContext.ui,
                Criteria: c,
                Evidence: e
            };
        },
        generateIncomingGradeValue: function (score, c, pc) {
            return {
                GradeObjectType: 1,
                PointsNumerator: score,
                Comments: {
                    Content: c || '',
                    Type: 'Text'
                },
                PrivateComments: {
                    Content: pc || '',
                    Type: 'Text'
                }
            };
        },
        whoAmI: function (cb) {
            var url = this.getUrls('who_am_i');
            return this.callAjax('GET', url, cb);
        }
    };
}(jQuery));
