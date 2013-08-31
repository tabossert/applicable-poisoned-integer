/**
 *  Routes related to provider tags
 */

var config = config = require('config')
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , util = require('util');

//DB
var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;

var memcached = require('../lib/memcached');

module.exports = function(app) {

  app.get('/api/getTags/:gid', function(req, res){
    rmysql.query('SELECT id,tag FROM gymTags WHERE gymid = ' + req.params.gid, function(err, result, fields) {
      if(err || result.length < 1) {
        res.send('{"status": "failed", "message":"unable to retrieve tags"}');
      } else {
        res.send(result);
      }
    });  
  });


  app.post('/api/addTag/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.gymid).isNumeric();
      check(req.body.tag).isAlphanumeric(); 
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {
        wmysql.query('INSERT INTO gymTags (gymid,tag) VALUES (' + wmysql.escape(req.body.gymid) + ',' + wmysql.escape(req.body.tag) + ')', function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message":"insert of tag row failed"}');
          } else {
            res.send('{"tid": "' + result.insertId + '"}');
          }
        });
      }
    });
  });


  app.del('/api/deleteTag/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.tid).isNumeric() 
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {
        wmysql.query('DELETE FROM gymTags WHERE id = ' + req.body.tid, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message":"unable to delete tag"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });
}