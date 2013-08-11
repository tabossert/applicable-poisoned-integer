/**
 *  Routes related to analytics
 */

var config = config = require('config')
  , moment = require('moment')
  , check = require('validator').check
  , sanitize = require('validator').sanitize;

// API config settings
var salt = config.Hash.salt;

//DB
var dbConn = require('../mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;

module.exports = function(app) {

  app.post('/api/gymView/', function(req, res){
    try {
      check(req.header('ltype')).isAlphanumeric();
      check(req.header('token')).notNull();
      check(req.body.gymid).isNumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    wmysql.query('INSERT INTO stats (gymid,userid,type,datetime) SELECT ' + req.body.gymid + ',id,0,NOW() FROM users WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "unable to add view"}');
      } else { 
        res.end('{"status": "success"}');
        }
     });
  });


  app.get('/api/gymStats/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT(SELECT COUNT(*) FROM stats s INNER JOIN gymUsers gu ON s.gymid = gu.gymid WHERE s.type = 1 AND gu.token = ' + rmysql.escape(req.header('token')) + ') AS visits,(SELECT COUNT(*) FROM stats s INNER JOIN gymUsers gu ON s.gymid = gu.gymid WHERE s.type = 0 AND gu.token = ' + rmysql.escape(req.header('token')) + ') AS views,(SELECT AVG(price) FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = ' + rmysql.escape(req.header('token')) + ') AS price', function(err, result, fields) {
    if(err || result.length < 1) {
      res.end('{"status": "failed", "message": "unable to retreive"}');
    } else {
      res.send(result);
      }
    });
  });

  
  // Analytics calls
  //Get partner stats per hour for a given day (psph - partner stats per hour)
  app.post('/api/barbell/psph', function(req, res){
    try {
      check(req.header('token')).notNull;
      check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2}/i);
      check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2}/i);    
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;    
    }
    amysql.query('SELECT gh.datetime AS dt,gh.reservations,gh.visits,gh.views,gh.amount FROM barbell.gymhourly gh INNER JOIN fitstew.gymUsers gu on gh.gymid = gu.gymid AND gh.datetime >= ' + amysql.escape(req.body.start) + ' AND gh.datetime < ' + amysql.escape(req.body.end) + ' AND gu.token = ' + amysql.escape(req.header('token')),function(err, result, fields) {
      if (err || result.length < 1) {
        res.send('{"status": "failed", "message":"invalid token"}',401);
      } else {
        res.send(result);
      }
    });
  });

  //Get partner stats per day for a given time period (psptp - partner stats per time period)
  app.post('/api/barbell/psptp', function(req, res){
    try {
      check(req.header('token')).notNull;
      check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2}/i);
      check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2}/i);    
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;    
    }
    console.log('SELECT DATE_FORMAT(gh.datetime , "%Y-%m-%d") AS dt,SUM(gh.reservations) as reservations,SUM(gh.visits) AS visits,SUM(gh.views) as views,SUM(gh.amount) AS amount FROM barbell.gymhourly gh INNER JOIN fitstew.gymUsers gu on gh.gymid = gu.gymid AND gh.datetime >= ' + amysql.escape(req.body.start) + ' AND gh.datetime < ' + amysql.escape(req.body.end) + ' AND gu.token = ' + amysql.escape(req.header('token')) + ' GROUP BY dt')
    amysql.query('SELECT DATE_FORMAT(gh.datetime , "%Y-%m-%d") AS dt,SUM(gh.reservations) as reservations,SUM(gh.visits) AS visits,SUM(gh.views) as views,SUM(gh.amount) AS amount FROM barbell.gymhourly gh INNER JOIN fitstew.gymUsers gu on gh.gymid = gu.gymid AND gh.datetime >= ' + amysql.escape(req.body.start) + ' AND gh.datetime < ' + amysql.escape(req.body.end) + ' AND gu.token = ' + amysql.escape(req.header('token')) + ' GROUP BY dt',function(err, result, fields) {
      if (err || result.length < 1) {
        res.send('{"status": "failed", "message":"invalid token"}',401);
      } else {
        res.send(result);
      }
    });
  });


  //Get partner stats per day for a given week and previous week (pspwp - partner stats per week percentage)
  app.post('/api/barbell/pspwp', function(req, res){
    try {
      check(req.header('token')).notNull;
      check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2}/i);
      check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2}/i);    
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;    
    }
    amysql.query('SELECT DATE_FORMAT(gh.datetime , "%Y-%m-%d") AS dt,SUM(gh.reservations) as reservations,SUM(gh.visits) AS visits,SUM(gh.views) as views,SUM(gh.amount) AS amount FROM barbell.gymhourly gh INNER JOIN fitstew.gymUsers gu on gh.gymid = gu.gymid AND gh.datetime >= ' + amysql.escape(req.body.start) + ' AND gh.datetime < ' + amysql.escape(req.body.end) + ' AND gu.token = ' + amysql.escape(req.header('token')) + ' GROUP BY dt',function(err, result, fields) {
      if (err || result.length < 1) {
        res.send('{"status": "failed", "message":"invalid token"}',401);
      } else {
        res.send(result);
      }
    });
  });



  //OLD CALLS
  app.post('/api/barbell/pcbh/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM fitstew.gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
      if (err || result.length < 1) {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      } else {
        rmysql.query('SELECT t1.classid,t1.reservations,t1.datetime FROM barbell.classhourly t1 INNER JOIN (SELECT classid,MAX(reservations) AS res,datetime AS max_date FROM barbell.classhourly WHERE gymid = ' + result[0].gymid + ' AND datetime >= "' + req.body.start + '" AND datetime < "' + req.body.end + '" GROUP BY classid) t2 ON t1.reservations = t2.res AND t1.classid = t2.classid GROUP BY classid', function(err, result, fields) {
          if (err || result.length < 1) {
            res.end('{"status": "failed", "message": "unable to retrieve"}');
          } else {
            res.send(result);
          }      
        });
      }
    });
  });


  app.post('/api/barbell/appc/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymusers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
      if (err || result.length < 1) {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      } else {
        rmysql.query('SELECT service,duration,ROUND(AVG(price),2) AS price,datetime FROM barbel.classhourly WHERE datetime >= "' + req.body.start + '" AND datetime < "' + req.body.end + '" GROUP BY service,duration', function(err, result, fields) {
          if (err || result.length < 1) {
            res.end('{"status": "failed", "message": "unable to retrieve"}');
          } else {
            res.send(result);
          }      
        });
      }
    });
  });


  app.post('/api/barbell/arph/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymusers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
      if (err || result.length < 1) {
        res.send('{"status": "failed", "message":"invalid token"}',401);
      } else {
        rmysql.query('SELECT ROUND(AVG(reservations),0) AS avgres,datetime FROM barbell.classhourly WHERE datetime >= "' + req.body.start + '" AND datetime < "' + req.body.end + '" GROUP BY datetime', function(err, result, fields) {
          if (err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to retrieve"}');
          } else {
            res.send(result);
          }      
        });
      }
    });
  });


  app.post('/api/barbell/rcbc/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymusers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
      if (err || result.length < 1) {
        res.send('{"status": "failed", "message":"invalid token"}',401);
      } else {
        rmysql.query('SELECT userid,gymid,classid,visits FROM barbell.repeats WHERE gymid = ' + result[0].gymid + ' GROUP BY userid,classid', function(err, result, fields) {
          if (err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to retrieve"}');
          } else {
            res.send(result);
          }      
        });
      }
    });
  });


  app.post('/api/barbell/cdbp/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.param).isAlphanumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymusers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
      if (err || result.length < 1) {
        res.send('{"status": "failed", "message":"invalid token"}',401);
      } else {
        try {
          rmysql.query('SELECT male,female,city,state,zipcode,total,datetime FROM barbell.demographic WHERE `' + req.body.param + '` = ' + rmysql.escape(req.body.value), function(err, result, fields) {
            if (err || result.length < 1) {
              res.send('{"status": "failed", "message": "unable to retrieve"}');
            } else {
              res.send(result);
            }      
          });
        } catch(e) {
          res.end('{"status": "failed", "message": "invalid param"}');
        }
      }
    });
  });
}