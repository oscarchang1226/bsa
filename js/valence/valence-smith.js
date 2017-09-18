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

var LEVERSION = '1.25',
    BASVERSION = '1.10',
    SMI = SMI || {};
SMI.getAppContext = function () {
    'use strict';
    var a = 'Bocs5Yg-9rEpxK_0L4dGUw',
        b = 'zEoByoY5l3sWLvBkwXAmcA';
    return new D2L.ApplicationContext(a, b);
};
SMI.getUserContext = function () {
    'use strict';
    var c = 'https://smithweb.brightspace.com',
        d = '443',
        e = 'e9RfZgHDTu3vm_gqMPsmfC',
        f = 'DphdEgK0jpS_8P-ZXaZQWR';
    return SMI.getAppContext().createUserContextWithValues(c, d, e, f);
};
SMI.endpoints = {
    put_grades: function (ou, gi, ui) {
        'use strict';
        return '/d2l/api/le/' + LEVERSION + '/' + ou + '/grades/' + gi + '/values/' + ui;
    },
    issue_award: function (ou) {
        'use strict';
        return '/d2l/api/bas/' + BASVERSION + '/orgunits/' + ou + '/issued/';
    }
};
SMI.preCall = function (cb) {
    'use strict';
    // $.get('/d2l/lp/auth/xsrf-tokens', cb);
    cb({'hitCodePrefix': '-1315665569', 'referrerToken': 'Znpl0OTAb63pYv88SK92DaKkwZsArud9'});
};
SMI.issueAward = function (ou, data) {
    'use strict';
    if (D2L) {
        var url,
            callback;
        url = SMI.endpoints.issue_award(ou);
        url = SMI.getUserContext().createUrlForAuthentication(url, 'POST');
        callback = function (d) {
            $.ajax(
                {
                    type: 'POST',
                    url: url,
                    success: function (x) { console.log(x); },
                    error: function (x) { console.log(x); },
                    contentType: "application/json",
                    dataType: 'json',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Csrf-Token': d.referrerToken
                    },
                    data: JSON.stringify(data)
                }
            );
        };
        return SMI.preCall(callback);
    }
    return null;
};
SMI.putGrades = function (ou, gi, ui, data) {
    'use strict';
    if (D2L) {
        var url,
            callback;
        url = SMI.endpoints.put_grades(ou, gi, ui);
        url = SMI.getUserContext().createUrlForAuthentication(url, 'PUT');
        callback = function (d) {
            $.ajax(
                {
                    type: 'PUT',
                    url: url,
                    success: function (x) { console.log(x); },
                    error: function (x) { console.log(x); },
                    contentType: "application/json",
                    dataType: 'json',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-Csrf-Token': d.referrerToken
                    },
                    data: JSON.stringify(data)
                }
            );
        };
        return SMI.preCall(callback);
    }
    return null;
};
