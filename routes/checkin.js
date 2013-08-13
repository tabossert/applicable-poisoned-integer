/**
 *  Routes related to user checkin
 */

var config = config = require('config')
  , moment = require('moment')
  , geo = require('geo')
  , geoip = require('geoip-lite')
  , check = require('validator').check
  , sanitize = require('validator').sanitize;

// API config settings
var salt = config.Hash.salt;

var dbConn = require('../mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;

module.exports = function(app) {
  
  app.post('/api/userCheckinByGym/', function(req, res) {
     try {
      check(req.header('token')).notNull();
      check(req.body.userid).isNumeric();
      check(req.body.sid).isNumeric();
      check(req.body.cid).isNumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    console.log('UPDATE schedule s INNER JOIN gymUsers gu ON s.gymid = gu.gymid SET s.checkin = 1, s.chkintime = NOW() WHERE s.userid = ' + req.body.userid + ' AND s.id = ' + req.body.sid + ' AND gu.token = ' + wmysql.escape(req.header('token')));
    wmysql.query('UPDATE schedule s INNER JOIN gymUsers gu ON s.gymid = gu.gymid SET s.checkin = 1, s.chkintime = NOW() WHERE s.userid = ' + req.body.userid + ' AND s.id = ' + req.body.sid + ' AND gu.token = ' + wmysql.escape(req.header('token')),function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.send('{"status": "failed", "message": "unable to checkin"}');
      } else {
        res.end('{"status": "success"}')
      }
    });
  });


  app.del('/api/deleteCheckinByGym/', function(req, res) {
     try {
      check(req.header('token')).notNull();
      check(req.body.userid).isNumeric();
      check(req.body.sid).isNumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    console.log('UPDATE schedule s INNER JOIN gymUsers gu ON s.gymid = gu.gymid SET s.checkin = 0, s.chkintime = NULL WHERE s.userid = ' + req.body.userid + ' AND s.id = ' + req.body.sid + ' AND gu.token = ' + wmysql.escape(req.header('token')))
    wmysql.query('UPDATE schedule s INNER JOIN gymUsers gu ON s.gymid = gu.gymid SET s.checkin = 0, s.chkintime = NULL WHERE s.userid = ' + req.body.userid + ' AND s.id = ' + req.body.sid + ' AND gu.token = ' + wmysql.escape(req.header('token')),function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.send('{"status": "failed", "message": "unable to delete checkin"}');
      } else {
        res.end('{"status": "success"}')
      }
    });
  });
}