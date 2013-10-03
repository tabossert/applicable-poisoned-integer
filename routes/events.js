/**
 *  Routes related to events
 */

var config = config = require('config')
  , moment = require('moment')
  , check = require('validator').check
  , sanitize = require('validator').sanitize

// API config settings
var memcached = require('../lib/memcached');
var middleFinger = require('../lib/middleFinger');

module.exports = function(app) {

  //get scheduledclass memobject
  //check open spots  -- return fail if class is not available or class is full
  //check if user balance - price is positive -- if not return balance too low
  //call addEvent

  app.post('/api/addEvent/', [middleFinger.tokenCheck], function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    var userid = 45;

    memcached.isMemScheduledClass(req.body.scheduledclassid, function(err, data) {
      if(data.classInfo.spotsReserved == data.classInfo.spots) {
        res.send('{"message": "Class Full"}');
      }

      data.participants.forEach(function(participant) {
       if(participant.userid == userid) {
          res.send('{"message": "Already Scheduled"}');
        }
      });

      var balance = 0;
      console.log(req.uData.balance);
      var bal = balance - data.price;
      if(bal < 0) {
        res.send('{"message": "Balance to low"}');
      }

      console.log("test")
      //stripe.charges.create({ amount: amount, currency: 'usd', customer: result[0].cToken }, function(err,charge) {

    console.log('run sp')
    /*wmysql.query('CALL addEvent(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ',' + price + ',' + req.body.scid + ',' + gymid +',' + wmysql.escape(req.body.datetime) + ')', function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "unable to add event6"}');
      } else {
        res.end('{' + result[0][0].transMess + '}');
      }
    });*/
     // });
    });
  });


  app.del('/api/events/:scheduleid', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
  });
}