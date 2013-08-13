/**
 *  Routes related to events
 */

var config = config = require('config')
  , moment = require('moment')
  , check = require('validator').check
  , sanitize = require('validator').sanitize

// API config settings
var salt = config.Hash.salt;

var dbConn = require('../mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;

module.exports = function(app) {

  app.post('/api/addEvent/', function(req, res){
    try {
      check(req.header('ltype')).isAlphanumeric();
      check(req.header('token')).notNull();
      check(req.body.scid).isNumeric()
      check(req.body.datetime).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i) 
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
      console.log('SELECT s.id FROM schedule s INNER JOIN users u ON s.userid = u.id WHERE s.sclassid = ' + req.body.scid + ' AND s.datetime = ' + wmysql.escape(req.body.datetime) +  ' AND u.`' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')));
      rmysql.query('SELECT s.id FROM schedule s INNER JOIN users u ON s.userid = u.id WHERE s.sclassid = ' + req.body.scid + ' AND s.datetime = ' + wmysql.escape(req.body.datetime) +  ' AND u.`' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
        if(result.length > 0) {
          res.end('{"status": "failed", "message": "already scheduled"}');
        } else {
          console.log('SELECT gymid,price FROM scheduledClass WHERE id = ' + req.body.scid + ' AND datetime >= "' + moment().utc().format('YYYY-MM-DD HH:mm:ss') + '"'); 
          rmysql.query('SELECT gymid,price FROM scheduledClass WHERE id = ' + req.body.scid + ' AND datetime >= "' + moment().utc().format('YYYY-MM-DD HH:mm:ss') + '"', function(err, result, fields) {
            if(err || result.length < 1) {
              res.end('{"status": "failed", "message": "class unavailable"}');
            } else {
              var price = result[0].price;
              var gymid = result[0].gymid;
              console.log('SELECT sc.spots - COUNT(s.sclassid) AS openSpots FROM schedule s INNER JOIN scheduledClass sc ON s.sclassid = sc.id WHERE s.sclassid = ' + req.body.scid + ' AND s.datetime = ' + wmysql.escape(req.body.datetime));
              rmysql.query('SELECT sc.spots - COUNT(s.sclassid) AS openSpots FROM schedule s INNER JOIN scheduledClass sc ON s.sclassid = sc.id WHERE s.sclassid = ' + req.body.scid + ' AND s.datetime = ' + wmysql.escape(req.body.datetime), function(err, result, fields) {
                console.log(result);
                console.log(result[0].openSpots)
                if (err || result[0].openSpots < 1) {
                  res.end('{"status": "failed", "message": "class full"}');
                } else {
                  console.log("no spots")
                  console.log('SELECT u.id AS uid,b.refillamount,b.cToken FROM users u INNER JOIN balance b ON u.id = b.userid WHERE b.minamount > u.balance - ' + price + ' AND b.automatic = true AND u.`' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')));
                  rmysql.query('SELECT u.id AS uid,b.refillamount,b.cToken FROM users u INNER JOIN balance b ON u.id = b.userid WHERE b.minamount > u.balance - ' + price + ' AND b.automatic = true AND u.`' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
                    console.log(result.length)
                    if(result.length > 0) {
                      var uid = result[0].uid;
                      var amount = result[0].refillamount * 100;
                      stripe.charges.create({ amount: amount, currency: 'usd', customer: result[0].cToken }, function(err,charge) {
                        if(err) {
                          res.end("refill not setup");
                        } else {
                          wmysql.query('CALL refillBalance(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ')', function(err, bresult, fields) {
                            if(err || bresult.affectedRows < 1 || bresult.length == 'undefined') {
                              var ts = Math.round((new Date()).getTime() / 1000);
                              fs.writeFile("logs/failedBalanceUpdate.log", uid + ',' + amount + ',' + ts, function(err) {
                                if(err) {
                                  console.log('Unable to save to log');
                                } else {
                                  console.log('Failure saved to log');
                                }
                              });
                              res.end('{"status": "failed", "message": "unable to refill balance"}');
                            } else {
                              wmysql.query('CALL addEvent(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ',' + price + ',' + req.body.scid + ',' + gymid +',' + wmysql.escape(req.body.datetime) + ')', function(err, result, fields) {
                                if(err || result.affectedRows < 1) {
                                  res.end('{"status": "failed", "message": "unable to add event"}');
                                } else {
                                  res.end('{' + result[0][0].transMess + '}');
                                }
                              });
                            }
                          });
                        }
                      });
                    } else {
                      console.log('run sp')
                      console.log('CALL addEvent(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ',' + price + ',' + req.body.scid + ',' + gymid +',' + wmysql.escape(req.body.datetime) + ')'   );
                      wmysql.query('CALL addEvent(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ',' + price + ',' + req.body.scid + ',' + gymid +',' + wmysql.escape(req.body.datetime) + ')', function(err, result, fields) {
                        if(err || result.affectedRows < 1) {
                          res.end('{"status": "failed", "message": "unable to add event6"}');
                        } else {
                          res.end('{' + result[0][0].transMess + '}');
                        }
                      });
                    }
                  });
                } 
              });
            }
          });
        }
      });
  });


  app.del('/api/deleteEvent/', function(req, res){  
    try {
      check(req.header('ltype')).isAlphanumeric();
      check(req.header('token')).notNull();
      check(req.body.sid).isNumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    wmysql.query('CALL deleteEvent(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ',' + req.body.sid + ')', function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "unable to add event"}');
      } else {
        if(result[0][0].transMess != "success") {
          res.end('{"status": "failed", "message": "' + result[0][0].transMess + '"}');
        } else {
          res.end('{"status": "success"}')
        }
      }
    });
  });    
}