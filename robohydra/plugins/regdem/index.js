var RoboHydraHeadFilesystem = require('robohydra').heads.RoboHydraHeadFilesystem
, RoboHydraHeadProxy        = require('robohydra').heads.RoboHydraHeadProxy
, RoboHydraHead             = require('robohydra').heads.RoboHydraHead;

var data = require('./data');

var transform_url = function (url) {
  var fragments = url.split('/');

  if (['fremdrift', 'start'].indexOf(fragments[fragments.length - 1]) > -1) {
    fragments.splice(fragments.length - 2, 1);
    return fragments.join('/');
  }

  return url;
};

var get_egenskap = function (body, egenskaper) {
  var egenskaper  = {}
  , egenskap      = null

  // mindre robhust måte å få henta ut data med
  if (body.content.registrer !== undefined) {
    egenskaper = body.content.registrer.vegObjekter[0].egenskaper;
  }
  else if (body.content.delvisOppdater !== undefined) {
    egenskaper = body.content.delvisOppdater.vegObjekter[0].egenskaper;
  }

  for (e in egenskaper) {
    if (egenskaper[e].typeId === 10288) {
      egenskap = parseInt(egenskaper[e].verdi[0]);
      break;
    }
  }

  return egenskap;
};

exports.getBodyParts = function (conf) {
  return {
    heads: [
      new RoboHydraHead({
        path: '/api',
        handler: function (req, res) {
          var result
          , body = JSON.parse(req.rawBody.toString());

          switch (transform_url(body.url)) {
            case '/nvdb/apiskriv/v2/endringssett/validator':
              setTimeout(function () {
                console.log('VALIDATOR');

                var egenskap = get_egenskap(body)
                , error = 0;

                if (egenskap === null) {
                  error = 1;
                }
                else if (egenskap < 1900) {
                  error = 2;
                }
                else if (egenskap > 2015) {
                  error = 3;
                }

                switch (error) {
                  case 1:   result = data.validator.missing;    break;
                  case 2:   result = data.validator.less;       break;
                  case 3:   result = data.validator.more;       break;
                  default:  result = data.validator.success;
                }

                res.send(JSON.stringify(result))
              }, 1000);
              break;

            case '/nvdb/apiskriv/v2/endringssett':
              setTimeout(function () {
                console.log('SEND ENDRINGSSETT');

                result = data.endringssett.success;
                res.send(JSON.stringify(result))
              }, 1500);
              break;

            case '/nvdb/apiskriv/v2/endringssett/start':
              setTimeout(function () {
                console.log('START');

                result = data.start.success;
                res.send(JSON.stringify(result))
              }, 1000);
              break;

            case '/nvdb/apiskriv/v2/endringssett/fremdrift':
              setTimeout(function () {
                console.log('FREMDRIFT: ' + result);

                result = Math.floor(Math.random() * 2) === 0 ? data.fremdrift.working : data.fremdrift.success
                res.send(JSON.stringify(result))
              }, 900);
              break

            default:
              res.send(JSON.stringify(data.fremdrift.success));
          }
        }
      }),

      new RoboHydraHeadProxy({
        name: 'Cookiemonster',
        mountPath: '/',
        proxyTo: 'http://localhost:8085/'
      })
    ]
  }
};
