//TODO

var config = require('config');
var memcached = require('../lib/memcached');

  var authCheck = function(req, res, next) {
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        req.eData = data;
        next();
      }
    });
  };

  var tokenCheck = function(req, res, next) {
    memcached.isMemToken(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {
        console.log(data)
        req.uData = data;
        next();
      }
    });
  };


module.exports = {
  authCheck: authCheck,
  tokenCheck: tokenCheck
};