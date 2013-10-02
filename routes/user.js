/**
 * User based routes
 */


/**
* TODO
* - Build auth middleware
* - Build additional models
* - convert calls to using new controllers
*/

var config = config = require('config')
  , moment = require('moment')
  , crypto = require('crypto')
  , geo = require('geo')
  , geoip = require('geoip-lite')
  , janrain = require('janrain-api')
  , check = require('validator').check
  , sanitize = require('validator').sanitize; 

 // API config settings
var engageAPI = janrain(config.Janrain.Key);
var salt = config.Hash.salt;
var stripeKey = config.Stripe.stripeKey;
var stripe = require('stripe')(stripeKey);


//DB
var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var memcached = require('../lib/memcached');
var middleFinger = require('../lib/middleFinger');

var userModel = require('../modelControllers/userController');

module.exports = function(app) {
    //var obj = {};
    //obj.id = 49;

    //var savObj = {};
      //savObj.email = 'jeas@gmail.com';
      //savObj.first_name = 'James';
      //savObj.last_name = 'dass';
      //savObj.city = 'Grawn';
      //savObj.id = 49;
      /*savObj.address = '3701 Count Road 633';
      savObj.city = 'Grawn';
      savObj.state = 'MI';
      savObj.zipcode = '94596';
      savObj.phone = '8057982850';
      savObj.sex = 'm';*/


    /*userModel.readUser(obj,'id',function(err, data) {
      console.log(err);
      console.log(data);
    });*/

    /*userModel.updateUser(savObj, function(err, result) {
      console.log(result);
      userModel.readUser(obj,function(err, data) {
        console.log(err);
        console.log(data);
      })
    });*/


    app.put('/api/user/', function(req, res){
      engageAPI.authInfo(req.header('token'), true, function(err, data) {
        if(err) {
          res.send(401,'{"status": "failed", "message": "invalid token"}');
          return;
        } else {
          memcached.setMemToken(data.profile,function(err, memResult) {
            if(err) {
              userModel.createUser(data.profile, function(err, result) {
                memcached.setMemToken(data.profile,function(err, memResult) {});
              });
            } else {
              memcached.setMemToken(data.profile,function(err, memResult) {
                var userObj = {};
                userObj.id = memResult.id;
                userModel.updateUser(userObj, function(err, result) {});
                res.send(memResult);
              });
            }
          });
        }
      });
    });


    app.put('/api/user/logout', function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      remMemToken(req.header('token'), function(err, result) {
        if(err) {
          res.send('{"status": "failed", "message": "unable to signout user"}');
        } else {
          res.send('{"status": "success"}');
        }
      });
    });


    app.get('/api/user/:uid', [middleFinger.tokenCheck], function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
        return;
      }

      res.send(req.uData);
    });



    app.put('/api/user/:uid', [middleFinger.tokenCheck], function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
        return;
      }

      req.body.id = req.uData.id;
      userModel.updateUser(req.body, function(err, result) {
        if(err) {
          res.send(400,'{"status": "failed", "message":"' + err + '"}');
        }
        console.log(req.uData.email)
        memcached.setMemToken(req.uData,function(err, memResult) {
          res.send(memResult);
        });
      });
    });


    app.del('/api/user/:uid', [middleFinger.tokenCheck], function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }

      req.body.id = req.uData.id;
      userModel.updateUser(req.body, function(err, result) {});
      memcached.remMemKey(req.header('token'));
    });


    app.put('/api/setPinCode/', function(req, res) {
      try {
        check(req.header('ltype')).isAlphanumeric();
        check(req.header('token')).notNull();
        check(req.body.phone).len(10,10).isNumeric()
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      try {
        wmysql.query('UPDATE users SET phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '"), pincode = ' + wmysql.escape(req.body.pincode) + ' WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
          if (err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message": "invalid token"}',401);
          } else {
            res.end('{"status": "success", "phone": "' + req.body.phone + '"}');
          }
        });
      } catch (e) {
        console.log(e);
        res.end('{"status": "failed", "message": "unable to update"}');
        return;
      } 
    });

    app.post('/api/userSchedule/', function(req, res){
      try {
        check(req.header('ltype')).isAlphanumeric();
        check(req.header('token')).notNull();
        //check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
        //check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      console.log('SELECT s.id,g.id AS gymid,g.name,g.image AS gymImage,s.sclassid,sc.classid AS classid,sc.service,sc.duration,sc.image,sc.datetime FROM schedule s INNER JOIN scheduledClass sc ON (s.sclassid = sc.id) INNER JOIN gyms g ON (s.gymid = g.id) INNER JOIN users u ON u.id = s.userid WHERE u.`' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')) + ' AND s.datetime > "' + req.body.start + '" AND s.datetime < "' + req.body.end + '" ORDER BY s.datetime')
      rmysql.query('SELECT s.id,g.id AS gymid,g.name,g.image AS gymImage,s.sclassid,sc.classid AS classid,sc.service,sc.duration,sc.image,sc.datetime FROM schedule s INNER JOIN scheduledClass sc ON (s.sclassid = sc.id) INNER JOIN gyms g ON (s.gymid = g.id) INNER JOIN users u ON u.id = s.userid WHERE u.`' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')) + ' AND s.datetime > "' + req.body.start + '" AND s.datetime < "' + req.body.end + '" ORDER BY s.datetime', function(err, result, fields) {
        if (err) {
          res.end('{"status": "failed", "message": "call failed"}');
        } else {
          res.send(result);
        }
      });
    });


    app.put('/api/updatePayment/', function(req, res){
      try {
        check(req.header('ltype')).isAlphanumeric();
        check(req.header('token')).notNull();
        check(req.body.automatic).isNumeric();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      wmysql.query('UPDATE balance b INNER JOIN users u ON b.userid = u.id SET refillamount =  ' + wmysql.escape(req.body.refillamount) + ',minamount = ' + wmysql.escape(req.body.minamount) + ',automatic = ' + wmysql.escape(req.body.automatic) + ', cToken = "' + wmysql.escape(req.body.cToken) + '" WHERE u.`' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
        if (err || result.affectedRows < 1) {
          res.end('{"status": "failed", "message":"unable to update"}');
        } else {
          res.end('{"status": "success", "message":"updated"}');
        }
      });
    });
}