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
var eventModel = require('../modelControllers/eventController');

module.exports = function(app) {

  //get scheduledclass memobject
  //check open spots  -- return fail if class is not available or class is full
  //check if user balance - price is positive -- if not return balance too low
  //call addEvent
//[middleFinger.tokenCheck],
  app.post('/api/addEvent/', function(req, res){
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
        return;
      }

      console.log(data)
      data.participants.forEach(function(participant) {
       if(participant.userid == userid) {
         console.log(userid)
          res.send('{"message": "Already Scheduled"}');
         return 0;
        }
      });

      var balance = 100;
      //var balance = req.uData.balance;
      var bal = balance - data.classInfo.price;
      if(bal < 0) {
        res.send('{"message": "Balance to low"}');
        return;
      }

      //console.log(data.classInfo)
      var eventObj = {};
      eventObj.userid = 45;
      eventObj.price = data.classInfo.price;
      eventObj.scheduledclassid = data.classInfo.id;
      eventObj.providerid = data.classInfo.providerid;
      eventObj.datetime = '"2013-10-26 20:00:00"';

      console.log('run sp')
      eventModel.createEvent(eventObj, function(err, result) {
        eventObj.id = result[0][0].transMess;
        res.send(eventObj)
      });
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