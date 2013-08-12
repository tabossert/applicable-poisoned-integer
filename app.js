
/**
 * Module dependencies.
 */

var express = require('express')
  , domain = require('domain')
  , crypto = require('crypto')
  , connect = require('connect')
  , fs = require("fs")
  , path = require("path")
  , S = require('string')
  , http = require('http')
  , https = require('https')
  , _mysql = require('mysql')
  , moment = require('moment')
  , mongoose = require("mongoose")
  , geo = require('geo')
  , geoip = require('geoip-lite')
  , janrain = require('janrain-api')
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , expressWinston = require('express-winston')
  , winston = require('winston')
  , config = require('config')
  , dbConn = require('./mysqlConn')
  , rmysql = dbConn.rmysql
  , wmysql = dbConn.wmysql
  , amysql = dbConn.amysql;



/**
* Logging setup
*/
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: 'logs/access.log', json: true, timestamp: true })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: 'logs/exceptions.log', json: true, timestamp: true })
  ],
  exitOnError: false
});


// API config settings
var engageAPI = janrain(config.Janrain.Key);
var salt = config.Hash.salt;
var stripeKey = config.Stripe.stripeKey;
var stripe = require('stripe')(stripeKey);

 // ## CORS middleware
 var allowCrossDomain = function(req, res, next) {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, ltype');
     res.header('Access-Control-Max-Age', '300');      
     // intercept OPTIONS method
     if ('OPTIONS' == req.method) {
       res.send(200);
     } else {
       next();
     }
 };


// SSL Certificate values
var options = {
  key: fs.readFileSync('ssl/api.fitstew.com-key.pem'),
  ca: fs.readFileSync('ssl/gd_bundle.crt'),
  cert: fs.readFileSync('ssl/api.fitstew.com.crt'),
  requestCert: true
}



// Build initial express Server
var app = module.exports = express();



// Set express server options
app.configure(function(){
  app.use(allowCrossDomain);
  app.use(express.favicon());
  //app.use(connect.compress());
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(expressWinston.logger({
    transports: [
      new winston.transports.File({
        filename: 'logs/requests.log',
        json: true,
        colorize: true
      })
    ]
  }));
  app.use(app.router);
  app.use(function(req, res, next) {
    var createDomain = domain.create();
    createDomain.on('error', function(err) {
      res.statusCode = 500;
      res.end(err.message + '\n');
      console.log("Req Domain Error: " + err);
      process.exit();
      createDomain.dispose();
    });
    createDomain.enter()
    next();
  });
});

var routePath=__dirname + "/routes/";
fs.readdirSync(routePath).forEach(function(file) {
    var route=routePath+file;
    require(route)(app);
});


// Default Route
app.get('/', function(req, res){
  res.send('FitStew API')
});	

// Health Check Route
app.get('/api/healthMe/', function(req, res){
  rmysql.query('SELECT id FROM transactions LIMIT 1', function(err, result) {
    if(err || result.length < 1) {
      res.send('"status": "failed"');
    } else {
      res.end('"status": "success');
    }
  });
});

//Set Cluster setting for workers
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < 3; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
    cluster.fork();
  });
} else {
  // Set Server to listen on specified ports
  http.createServer(app).listen(config.Express.http);
  console.log("started server on " + config.Express.http);

  https.createServer(options, app).listen(config.Express.https);
  console.log("started server on " + config.Express.https);
}
