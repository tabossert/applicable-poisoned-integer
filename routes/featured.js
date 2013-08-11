/**
 *  Routes related to featured listings
 */

var config = config = require('config'); 
var dbConn = require('../mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;

module.exports = function(app) {
  
  app.get('/api/featuredGyms/', function(req, res){
    //var loc = geoip.lookup(req.connection.remoteAddress);
    //AND city = "' + loc.city + '" AND state = "' + loc.region + '"'
    rmysql.query('SELECT id,name,address,city,state,zipcode,phone,email FROM gyms WHERE featured = true', function(err, result, fields) {
      if (err || result.length < 1) {
       res.send('{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
      }
    });
  });


  app.get('/api/featuredWorkouts/', function(req, res){
    rmysql.query('SELECT id,gymid,service FROM classes WHERE featured = true', function(err, result, fields) {
      if (err || result.length < 1) {
       res.end('{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
      }
    });
  });
}