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

   es.indexProvider(22,function(err, obj) {
    console.log(err);
    console.log(obj);
   });

   keywords = ['yoga'];
  
   es.search(keywords,'1',37.88,-122.05,function(err,data) {
    console.log(err);
    console.log(data.hits[0]._source)
   });

    // Route returns providers using zip or state.  This would be used on the home page before signup
    app.get('/api/gymSearch/:type/:value/:state', function(req, res){
      if(req.params.type == 'zipcode') {
        var where = 'WHERE zipcode = ' + rmysql.escape(req.params.value) + ' AND state = ' + rmysql.escape(req.params.state);
      } else if(req.params.type == 'city') {
        var where = 'WHERE city = ' + rmysql.escape(req.params.value) + ' AND state = ' + rmysql.escape(req.params.state);
      } else if(req.params.type == 'name') {
        var where = 'WHERE name like ' + rmysql.escape('%' + req.params.value + '%');
      }
      rmysql.query('SELECT id,name,address,city,state,zipcode,email,phone FROM gyms ' + where, function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "no gyms found"}');
        } else {
          res.send(result);
        }
      });
    });

    // Route returns providers on myPanel from search params
    /*app.post('/api/gymSearchAdvanced/', function(req, res){
      var disObj = {};
      // Get location from address, Mongo query happens here using 2d geo-spatial index
      function getLoc(address,distance,callback) {
        var maxDistance = distance/69;
        var idArr = ""
        , j = 0
        // Geocoder gets lat/lng from addesss
        geo.geocoder(geo.google, address, false,  function(fAddress,lat,lng) {
          // Get provider id's from Mongo using lat/lng 2d geo-spatial index
          cordinatesModel.db.db.executeDbCommand({geoNear: "cordinates", near: [lng, lat], maxDistance: distance/3959 ,distanceMultiplier: 3959, spherical: true }, function(err,res) {
            if(err) {
              res.end('{"status": "failed", "message":"No Gym matched location"}');
            } else {
              // Create array of matching provider id's
              res.documents.forEach(function(doc) {
                  doc.results.forEach(function(obj) {
                  disObj[obj.obj.gymid] = obj.dis; 
                  if(j < 1) {
                    idArr = idArr + obj.obj.gymid;
                    j++;
                  } else {
                    idArr = idArr + ',' + obj.obj.gymid;
                  }
                });
                });
              callback(idArr);
            }
          });
        });
      }

      var i, len = 0
      , query = ''
      , where = '';

      query = query + ' INNER JOIN classes c ON g.id = c.gymid';
      var match = "";
      if(req.body.workouts !== undefined) {
        var terms = req.body.workouts.split(',')
        len = terms.length;

        for (i = 0; i < len; i++){
          if(i == 0)
          {
            var term = S(terms[i]).trim();
            where = where + ' WHERE (c.service = "' + term + '"';
          } else {
              var term = S(terms[i]).trim();
            where = where + ' OR c.service = "' + term + '"';
          }
        }
        where = where + ')';
        match = 'GROUP_CONCAT(DISTINCT service) AS matched,';
      } else {
        match = '"" AS matched,';
      }
      try {
        if(req.body.name !== undefined) {
          where = where + ' AND g.name like "%' + req.body.name + '%"';
        }
        if(req.body.rate !== undefined) {
          where = where + ' AND c.price < ' + req.body.rate;
        }
      } catch (e) {
        return;
      }


      function runQuery(query,where,callback){
        rmysql.query('SELECT g.id,count(c.id) AS level,' + match + 'g.name,g.address,g.city,g.state,g.zipcode,g.phone,g.email,g.image,g.facebook,g.twitter,g.googleplus,g.url,h.mondayOpen,h.mondayClose,h.tuesdayOpen,h.tuesdayClose,h.wednesdayOpen,h.wednesdayClose,h.thursdayOpen,h.thursdayClose,h.fridayOpen,h.fridayClose,h.saturdayOpen,h.saturdayClose,h.sundayOpen,h.sundayClose FROM gyms g INNER JOIN hours h ON g.id = h.gymid ' + query + where, function(err, result, fields) {
        console.log('SELECT g.id,count(c.id) AS level,' + match + 'g.name,g.address,g.city,g.state,g.zipcode,g.phone,g.email,g.image,g.facebook,g.twitter,g.googleplus,g.url,h.mondayOpen,h.mondayClose,h.tuesdayOpen,h.tuesdayClose,h.wednesdayOpen,h.wednesdayClose,h.thursdayOpen,h.thursdayClose,h.fridayOpen,h.fridayClose,h.saturdayOpen,h.saturdayClose,h.sundayOpen,h.sundayClose FROM gyms g INNER JOIN hours h ON g.id = h.gymid ' + query + where);
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "No Results"}');
        } else {
        console.log(disObj);
           result.forEach(function(res) {
              res['distance'] = Math.round(10*disObj[res.id])/10;
            });
            console.log(result);
            res.send(result);
           }
        });
      }

      if(typeof(req.body.address) !== 'undefined'){
        getLoc(req.body.address,req.body.maxDistance,function(idArr) {
          where = where + ' AND g.id IN (' + idArr + ') GROUP BY g.id ORDER BY level DESC, FIND_IN_SET(g.id,"' + idArr + '") ASC';
          runQuery(query,where,function() {});
         });
      } else {
        runQuery(query,where,function() {});
      }
    });

    app.post('/api/gymId/', function(req, res) {
      console.log("Lat: " + req.body.lat + " Lng: " + req.body.lng);
      var lat = req.body.lat;
      var lng = req.body.lng;

      cordinatesModel.find({loc : { $near: [lat, lng], $maxDistance: 0.00027448396957 }} , function(err, result) {
        if (err || result.length < 1) {
          res.send('{"status": "failed", "message":"No Gym matched ID"}');
        } else {
          console.log(result);
          res.send(result);
        }
      });
    });*/


    /*app.get('/api/gymInfo/:gymId', function(req, res){
      try {
        check(req.params.gymId).notNull().isNumeric()
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      rmysql.query('SELECT g.id,g.name,g.address,g.city,g.state,g.zipcode,g.phone,g.email,g.contact,g.rate,g.image,g.facebook,g.twitter,g.googleplus,g.url,h.mondayOpen,h.mondayClose,h.tuesdayOpen,h.tuesdayClose,h.wednesdayOpen,h.wednesdayClose,h.thursdayOpen,h.thursdayClose,h.fridayOpen,h.fridayClose,h.saturdayOpen,h.saturdayClose,h.sundayOpen,h.sundayClose FROM gyms g INNER JOIN hours h ON g.id = h.gymid WHERE g.id = ' + rmysql.escape(req.params.gymId), function(err, result, fields) {
        if (err || result.length < 1) {
          res.send('{"status": "failed", "message": "no gym matches"}');
        } else {
          res.send(result);
        }
      });
    });*/

}