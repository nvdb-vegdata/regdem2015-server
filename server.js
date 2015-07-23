var express = require('express')
, bodyParser = require('body-parser');

var cookieMonster = require('./lib/CookieMonster');

var app = express()
, port = process.env.PORT || 8085
, router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


router.get('/test', function (req, res) {
  res.json({ message: 'Running' });
});

router.route('/')
  .get(function (req, res, next) {
    var options = {
      path: '/nvdb/apiskriv/status'
    };

    cookieMonster.getData(function (data) {
      res.json({ response: data.toString() });
    }, options);
  })
  .post(function (req, res, next) {
    if (req.body.content === undefined || req.body.content.length === 0) {
      res.json({error: 'Failed: no content'})
      return;
    }

    if (req.body.url === undefined || req.body.url.length === 0) {
      res.json({error: 'Failed: no URL'})
      return;
    }

    var options = {
      method: 'POST',
      body: JSON.stringify(req.body.content),
      path: req.body.url,
      dryrun: req.body.dryrun || false
    };

    cookieMonster.getData(options, function (data) {
      console.log(data.toString());
      res.send(data.toString() );
    });

  });

app.use('/app', express.static('regdem2015'));

// Path starts with /api
app.use('/api', router);

// Enable CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(port);
console.log('Starting server on port ' + port);
