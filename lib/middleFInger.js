//TODO

var config = require('config');
var memcached = require('../lib/memcached');

  var authCheck = function(req, resp, next) {
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        req.eData = data;
        next();
      }
    });
  };


module.exports = {
  authCheck: authCheck,
};