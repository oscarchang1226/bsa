(function(a){window.SMI={LEVERSION:"1.25",BAVERSION:"1.0",LPVERSION:"1.18",currentContext:{},endpoints:{who_am_i:"/d2l/api/lp/"+this.LPVERSION+"/users/whoami"},init:function(b){this.currentContext=b;this.endpoints={user_grade:"/d2l/api/le/"+this.LEVERSION+"/"+b.ou+"/grades/"+b.gi+"/values/"+b.ui,grade:"/d2l/api/le/"+this.LEVERSION+"/"+b.ou+"/grades/"+b.gi,grade_stats:"/d2l/api/le/"+this.LEVERSION+"/"+b.ou+"/grades/"+b.gi+"/statistics",associations:"/d2l/api/bas/"+this.BAVERSION+"/orgunits/"+b.ou+"/associations/",issue_award:"/d2l/api/bas/"+this.BAVERSION+"/orgunits/"+b.ou+"/issued/",who_am_i:"/d2l/api/lp/"+this.LPVERSION+"/users/whoami"}},getAppContext:function(){var d="Bocs5Yg-9rEpxK_0L4dGUw",c="zEoByoY5l3sWLvBkwXAmcA";return new D2L.ApplicationContext(d,c)},getUserContext:function(){var i="https://smithweb.brightspace.com",h="443",g="e9RfZgHDTu3vm_gqMPsmfC",b="DphdEgK0jpS_8P-ZXaZQWR";return this.getAppContext().createUserContextWithValues(i,h,g,b)},preCall:function(b){if(this.currentContext.prod){a.get("/d2l/lp/auth/xsrf-tokens",b)}else{b({hitCodePrefix:"-1315665569",referrerToken:"Znpl0OTAb63pYv88SK92DaKkwZsArud9"})}},callAjax:function(c,e,b,f){if(typeof b!=="function"){b=function(g,h){if(g.status!==200){console.error(g.statusText,h)}}}e=this.getUserContext().createUrlForAuthentication(e,c);var d=function(h){var g={type:c,url:e,complete:b,headers:{"X-Csrf-Token":h.referrerToken}};if("POST"===c.toUpperCase()||"PUT"===c.toUpperCase()){g.dataType="json";g.contentType="application/json";g.data=JSON.stringify(f);g.headers.Accept="application/json";g.headers["Content-Type"]="application/json"}a.ajax(g)};return this.preCall(d)},getAssociations:function(b){var c=this.endpoints.associations;return this.callAjax("GET",c,b)},issueAward:function(b,d){var c=this.endpoints.issue_award;return this.callAjax("POST",c,b,d)},getGrade:function(b){var c=this.endpoints.grade;return this.callAjax("GET",c,b)},getGradeStats:function(b){var c=this.endpoints.grade_stats;return this.callAjax("GET",c,b)},getUserGrade:function(b){var c=this.endpoints.user_grade;return this.callAjax("GET",c,b)},putUserGrade:function(b,d){var c=this.endpoints.user_grade;return this.callAjax("PUT",c,b,d)},generateIssuedAwardCreate:function(d,b){return{AwardId:this.currentContext.ai,IssuedToUserId:this.currentContext.ui,Criteria:d,Evidence:b}},whoAmI:function(b){var c=this.endpoints.who_am_i;return this.callAjax("GET",c,b)}}}(jQuery));