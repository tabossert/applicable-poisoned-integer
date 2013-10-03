/**
 * User based routes
 */


/**
* TODO
*/

var config = require('config')
  , janrain = require('janrain-api')
  , check = require('validator').check
  , sanitize = require('validator').sanitize;

 // API config settings
var engageAPI = janrain(config.Janrain.Key);

var memcached = require('../lib/memcached');
var middleFinger = require('../lib/middleFinger');
var userModel = require('../modelControllers/userController');

module.exports = function(app) {

    app.put('/api/user/', function(req, res){
      engageAPI.authInfo(req.header('token'), true, function(err, data) {
        if(err) {
          res.send(401,'{"status": "failed", "message": "invalid token"}');
          return;
        } else {
          memcached.setMemToken(data.profile,function(err, memResult) {
            if(err) {
              if(err == 'account disabled') {
                res.send(400,'{"status": "failed", "message": "' + err + '"}');
                return;
              }
              userModel.createUser(data.profile, function(err, result) {
                memcached.setMemToken(data.profile,function(err, memResult) {});
              });
            } else {
              memcached.setMemToken(data.profile,function(err, memResult) {
                if(err) {
                  console.log(err)
                  res.send(400,'{"status": "failed", "message": "' + err + '"}');
                }
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


    app.get('/api/user/:userid', [middleFinger.tokenCheck], function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
        return;
      }

      res.send(req.uData);
    });



    app.put('/api/user/:userid', [middleFinger.tokenCheck], function(req, res){
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

        memcached.setMemToken(req.uData,function(err, memResult) {
          res.send(memResult);
        });
      });
    });


    app.del('/api/user/:userid', [middleFinger.tokenCheck], function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.end(400,'{"status": "failed", "message":"' + e.message + '"}');
        return;
      }

      var userObj = {}
      userObj.id = req.uData.id;
      userObj.status = 0;
      userModel.updateUser(userObj, function(err, result) {
        res.send();
      });

      memcached.remMemKey(req.header('token'));
    });


    app.get('/api/user/:userid/schedule/', [middleFinger.tokenCheck], function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }

      readSchedule(req.uData, function(err, result) {
        if(err) {
          res.send(400,'{"status": "failed", "message":"' + err + '"}');
        }

        res.send(result);
      });
    });


    app.get('/api/user/:userid/refill/', [middleFinger.tokenCheck], function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }

      userModel.readRefill(req.uData, function(err, result) {
        console.log(err)
        if(err) {
          res.send(400,'{"status": "failed", "message":"' + err + '"}');
        }

        res.send(result);
      });
    });


    app.put('/api/user/:userid/refill/', [middleFinger.tokenCheck], function(req, res){
      try {
        check(req.header('token')).notNull();
      } catch (e) {
        res.end('{"status": "failed", "message":"' + e.message + '"}');
        return;
      }

      req.body.id = req.uData.id;
      userModel.updateRefill(req.body, function(err, result) {
        if(err) {
          res.send(400,'{"status": "failed", "message":"' + err + '"}');
        }

        userModel.readRefill(req.uData, function(err, result) {
          res.send(result);
        });
      });
    });
}