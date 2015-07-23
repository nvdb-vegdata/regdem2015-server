/*
 * Performs request to given host and path
 */


var https = require('https');

var Req = function Req(host, port, path, method) {
  this.host = host;
  this.port = port;
  this.path = path;
  this.method = method || 'POST';
}

/*
 * Options: port, path, method, error
 *   PORT: the port
 *   PATH: new path to request
 *   METHOD: POST/GET/...
 *   ERROR: custom error callback
 */
Req.prototype.request = function (cookie, callback, options) {
  options = options || {};
  options.body = options.body || '';

  var headers = {
    'Cookie': cookie
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json',
    headers['Content-Length'] = Buffer.byteLength(options.body), // .length,
    headers['Accept'] = 'application/json',
    headers['X-Nvdb-Dryrun'] = options.dryrun ? true : false
  }

  this.req = https.request({
    host: this.host,
    port: options.port || this.port,
    path: options.path || this.path,
    method: options.method || this.method,
    rejectUnauthorized: false,
    requestCert: true,
    agent: false,
    headers: headers,
  }, callback);


  if (options.body) {
    console.log(JSON.stringify(options.body));
    this.req.write(options.body, 'utf8');
  }
  this.req.end();

  if (options.error !== undefined) {
    this.req.on('error', options.error);
  }
  else {
    this.req.on('error', function (err) {
      console.log(err);
    })
  }
};

module.exports = Req;
