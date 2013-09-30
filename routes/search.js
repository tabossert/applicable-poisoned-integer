/**
 * Provide search based routes
 */

//TODO
//rewrite search to use elasticsearch and memcache


var config = config = require('config')
  , moment = require('moment')
  , S = require('string')
  , geo = require('geo')
  , geoip = require('geoip-lite')
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , es = require('../lib/elasticsearch');

var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;


module.exports = function(app) {

   /*es.indexClass(122,function(err, obj) {
    console.log(err);
    console.log(obj);
   });
  

   keywords = 'austin';
  
   es.search(keywords,'1',37.88,-122.05,function(err,data) {
    console.log(err);
    console.log(data.hits[0]._source)
   });*/

  // 
  app.get('/api/search/', function(req, res){
    geo.geocoder(geo.google, req.query.address, false,  function(fAddress,lat,lon) {
      es.search(req.query.keyword,req.query.distance,lat,lon,function(err,data) {
        if(data.hits.length > 0) {
          console.log(data.hits.length)
          res.send(data.hits);
        } else {
          res.send('no results');
        }
      });
    });
  });
}