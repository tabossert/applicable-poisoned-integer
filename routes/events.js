/**
 *  Routes related to events
 */

var config = config = require('config')
  , moment = require('moment')
  , errMsg = require('../lib/errMsg')
  , check = require('validator').check
  , sanitize = require('validator').sanitize;

// API config settings
var memcached = require('../lib/memcached');
var middleFinger = require('../lib/middleFinger');
var eventModel = require('../modelControllers/eventController');


module.exports = function(app) {

  app.post('/api/addEvent/', [middleFinger.tokenCheck], function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    memcached.isMemScheduledClass(req.body.scheduledclassid, function(err, data) {
      if(data.classInfo.spotsReserved == data.classInfo.spots) {
        res.send('{"message": "Class Full"}');
        return;
      }

      data.participants.forEach(function(participant) {
       if(participant.userid == req.uData.id) {
          res.send('{"message": "Already Scheduled"}');
         return;
        }
      });

      var bal = req.uData.balance - data.classInfo.price;
      if(bal < 0) {
        res.send('{"message": "Balance to low"}');
        return;
      }

      var eventObj = {};
      eventObj.userid = req.uData.id;
      eventObj.price = data.classInfo.price;
      eventObj.scheduledclassid = data.classInfo.id;
      eventObj.providerid = data.classInfo.providerid;
      eventObj.datetime = data.classInfo.datetime;

      eventModel.createEvent(eventObj, function(err, result) {
        eventObj.id = result[0][0].transMess;
        res.send(eventObj)
      });
    });
  });


  app.del('/api/events/:scheduleid', [middleFinger.tokenCheck], function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
    } catch (e) {
      res.end(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    eventModel.deleteEvent(req.params.scheduleid, function(err, result) {
      if(err) {
        res.send(400,'{"message": "' + result + '"}');
      }

      res.send('{"status": "success"}');
    });
  });
}