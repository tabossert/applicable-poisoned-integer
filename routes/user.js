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

var userModel = require('../modelControllers/userController');

module.exports = function(app) {
    var obj = {};
    obj.id = 49;

    var savObj = {};
      //savObj.email = 'jeas@gmail.com';
      savObj.first_name = 'James';
      savObj.last_name = 'dass';
      savObj.city = 'Grawn';
      savObj.id = 49;
      /*savObj.address = '3701 Count Road 633';
      savObj.city = 'Grawn';
      savObj.state = 'MI';
      savObj.zipcode = '94596';
      savObj.phone = '8057982850';
      savObj.sex = 'm';*/

    /*userModel.readUser(obj,function(err, data) {
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


    app.post('/api/userSignup/', function(req, res){
      try {
        engageAPI.authInfo(req.header('token'), true, function(err, data) {
          if(err) {
            res.send('{"status": "failed", "message": "invalid token"}');
            return;
          } else {
            try {
              wmysql.query('SELECT id AS uid,email FROM users WHERE email = AES_ENCRYPT("' + data.profile.email + '","' + salt + '")', function(err, result, fields) {
                require('crypto').randomBytes(48, function(ex, buf) {
                  var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
                  if(err || result.length < 1) {
                    if(data.profile.providerName == 'Google') {
                      var provider = 'google';
                      var pid = data.profile.googleUserId;
                    } else if(data.profile.providerName == 'Facebook') {
                      var provider = 'facebook';
                      var pid = '1111';
                    } else {
                      var provider = 'unknown';
                      var id = 0;
                    }
                    wmysql.query('INSERT INTO users (email,first_name,last_name,`' + req.header('ltype') + '_token`,created,lastlogin) VALUES (AES_ENCRYPT("' + data.profile.email + '","' + salt + '"),"' + data.profile.name.givenName + '","' + data.profile.name.familyName + '","' + token + '",NOW(),NOW())', function(err, result, fields) {
                      if (err || result.affectedRows < 1) {
                        res.end('{"status": "failed", "message": "unable to add user"}');
                      } else {
                        wmysql.query('INSERT INTO balance (userid,automatic,refillamount,minamount) VALUES(' + result.insertId + ',false,0,0)', function(err, result, fields) {
                          if (err || result.affectedRows < 1) {
                            res.end('{"status": "failed", "message": "unable to add user"}');
                          } else {
                            res.end('[{"userid": "' + result.insertId + '", "token": "' + token + '"}]');
                          }
                        });
                      }
                    });
                  } else {
                    var uid = result[0].uid;
                    wmysql.query('UPDATE users SET `' + req.header('ltype') + '_token` = "' + token + '", lastlogin = NOW() WHERE email = AES_ENCRYPT("' + data.profile.email + '","' + salt + '") AND status = 0', function(err, result, fields) {
                      if (err || result.affectedRows < 1) {
                        res.end('{"status": "failed", "message": "unable to update user"}');
                      } else {
                        res.end('[{"userid": "' + uid + '", "token": "' + token + '"}]');
                      }
                    });
                  }
                });
              });
            } catch (e) {
              res.end('{"status": "failed", "message": "unable to login"}');
              return;
            }
          }
        });
      } catch (e) {
        res.end('{"status": "failed", "message": "unable to login"}');
        return;
      }
    });


    app.get('/api/userSignout/', function(req, res){
      try {
        check(req.header('ltype')).isAlphanumeric();
        check(req.header('token')).notNull();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      wmysql.query('UPDATE users SET `' + req.header('ltype') + '_token` = null WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
        if(err || result.affectedRows < 1) {
          res.end('{"status": "failed", "message": "unable to signout user"}'); 
        } else {
          res.end('{"status": "success"}');
        }
      });
    });

    app.get('/api/balance/', function(req, res){
        try {
            check(req.header('ltype')).isAlphanumeric();
            check(req.header('token')).notNull();
        } catch (e) {
            res.end('{"status": "failed", "message":"' + e.message + '"}');
            return;
        }
        var obj = {};
        obj.id = 49;

        userModel.readUser(obj, function(err, result) {
          console.log(err);
          console.log(result);
        });
    });

    app.get('/api/userPreferences/', function(req, res){
      try {
        check(req.header('ltype')).isAlphanumeric();
        check(req.header('token')).notNull();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      rmysql.query('SELECT CONVERT(AES_DECRYPT(u.email,"' + salt + '") USING utf8) AS email,u.first_name,u.last_name,CONVERT(AES_DECRYPT(u.address,"' + salt + '") USING utf8) AS address,CONVERT(AES_DECRYPT(u.address2,"' + salt + '") USING utf8) AS address2,u.city,u.state,u.zipcode,b.automatic,b.refillamount,b.minamount,b.cToken,CONVERT(AES_DECRYPT(u.phone,"' + salt + '") USING utf8) AS phone FROM users u INNER JOIN balance b ON u.id = b.userid WHERE u.`' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')), function(err, result, fields){
      if (err || result.length < 1) {
        res.end('{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
        }    
      });
    });

    app.put('/api/updateUserPreferences/', function(req, res){
      try {
        check(req.header('ltype')).isAlphanumeric();
        check(req.header('token')).notNull();
        check(req.body.email).isEmail()
        check(req.body.zipcode).len(5,5).isNumeric()
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      wmysql.query('UPDATE users SET first_name = ' + wmysql.escape(req.body.first_name) + ', last_name = ' + wmysql.escape(req.body.last_name) + ', address = AES_ENCRYPT("' + req.body.address + '","' + salt + '"), address2 = AES_ENCRYPT("' + req.body.address2 + '", "' + salt + '"), city = ' + wmysql.escape(req.body.city) + ', state = ' + wmysql.escape(req.body.state) + ', zipcode = "' + req.body.zipcode + '" WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
        if(err || result.affectedRows < 1) { 
          res.end('{"status": "failed", "message": "unable to update"}');
        } else {
          res.end('{"status": "success"}');
        }
      });
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

    app.del('/api/deleteAccount/', function(req, res){ 
      try {
        check(req.header('ltype')).isAlphanumeric();
        check(req.header('token')).notNull();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }
      wmysql.query('UPDATE users SET status = 1 WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
        if(err || result.affectedRows < 1) {
         res.end('{"status": "failed", "message": "unable to delete account"}');
        } else {
          res.end('{"status": "success"}');
        }
      });
    });


    app.put('/api/updatePayment/', function(req, res){
      try {
        check(req.header('ltype')).isAlphanumeric();
        check(req.header('token')).notNull();
        check(req.body.automatic).isNumeric;
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