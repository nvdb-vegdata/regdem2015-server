var https         = require('https')
, req             = require('./Req')
, cookieHelper    = require('./CookieHelper');

var api           = '/nvdb/apiskriv/status'
, config          = require('../config')
, host            = 'www.utv.vegvesen.no'
, login           = '/openam/UI/Login?IDToken1=' + config.username + '&IDToken2=' + config.password + '&module=LDAP'
, loginCookie     = [];

var apiReq        = new req(host, 443, api, 'GET')
, loginReq        = new req(host, 443, login, 'GET');


/* Exports functions
------------------------------------------------------------------------------*/
module.exports = CookieMonster;

function CookieMonster() {

}

CookieMonster.prototype.result = [];

/* Fetch data - do magic - Supports calls like:
   - getData(options, callback)
   - getData(callback)
------------------------------------------------------------------------------*/
CookieMonster.prototype.getData = function (options, callback) {
  var self = this;

  // support getData(callback)
  if (typeof options === 'function') {
    callback = options;
  }

  self.result = [];

  apiReq.request(loginCookie.join(', '), function (res) {
    res.on('data', function (data) {
      if (res.statusCode !== 302) {
        self.result.push(data);
      }
    });

    res.on('end', function () {
      if (res.statusCode === 302) {
        // Login request
        loginReq.request('', function (loginRes) {
          loginRes.on('data', function (data) { });

          loginRes.on('end', function () {
            loginCookie = cookieHelper.parseCookies(loginRes.headers['set-cookie']);

            // Call itself when cookie is fetched
            self.getData(options, callback);
          })
        });
      }
      else {
        // successful1!!!!11
        callback(self.result, loginCookie);
      }
    });
  }, options);
};
