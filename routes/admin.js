/**
 *  Routes related to admin panel
 */

var config = config = require('config')
  , moment = require('moment')
  , crypto = require('crypto')
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
  
  //ADMIN Section of calls

  app.post('/api/aLogin/', function(req, res) {
     rmysql.query('SELECT au.userid FROM users u INNER JOIN adminUsers au ON u.id = au.userid WHERE u.email = AES_ENCRYPT("' + req.body.username + '","' + salt + '") AND au.password = ' + rmysql.escape(req.body.password), function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message":"Invalid username/password"}',401);
      } else {
        require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
          var userid = result[0].userid;
          wmysql.query('UPDATE adminUsers set token = "' + token + '" WHERE userid = ' + userid, function(err, result, fields) {
            if(err || result.affectedRows < 1) {
              res.send('{"status": "failed", "message": "unable to update"}');
            } else {
              res.end('{"status": "success", "token": "' + token + '"}');
            }
          });
        });    
      }
    });
  });


  app.get('/api/aLogout/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    wmysql.query('UPDATE adminUsers SET token = null WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.send('{"status": "failed", "message": "unable to logout"}');  
      }
      else {
        res.end('{"status": "success"}');
      }
    });
  });


  app.post('/api/getFC/', function(req, res){
    console.log(req.body.offset);
    console.log(req.header('token'));
    try {
      check(req.header('token')).notNull();
      check(req.body.offset).isNumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.length > 0) {
        rmysql.query('SELECT g.id,g.name,g.address,g.city,g.state,g.zipcode,g.email,g.phone,g.contact,gb.balance,d.paymenttype,d.paylimit,d.type FROM gyms g INNER JOIN gymBilling gb ON g.id = gb.gid INNER JOIN disbursement d ON g.id = d.gymid INNER JOIN paymentmethod p ON p.id = d.type ORDER BY g.id DESC LIMIT 20 OFFSET ' + req.body.offset, function(err, result, fields) {
          if(err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to retreive"}');  
          } else {
            res.send(result);
          }
        });
      } else {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      }
    });
  });


  app.get('/api/getEmployees/:gid', function(req, res){
    console.log(req.header('token'));
    try {
      check(req.header('token')).notNull();
      check(req.params.gid).isNumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.length > 0) {
        rmysql.query('SELECT id,gymid,username,first_name,last_name,groupid,lastlogin,phone,email,active,title FROM gymUsers WHERE gymid = ' + result[0].gymid, function(err, result, fields) {
          if(err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to retreive"}');  
          } else {
            res.send(result);
          }
        });
      } else {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      }
    });
  });


  app.post('/api/updateEmployee/:guid', function(req, res){
    console.log(req.header('token'));
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.length > 0) {
        rmysql.query('UPDATE gymUsers set first_name = ' + req.body.first_name + ',last_name = ' + req.body.last_name + ',groupid = ' + req.body.groupid + ',password = ' + req.body.password + ' WHERE id = ' + req.params.guid, function(err, result, fields) {
          if(err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to update"}');  
          } else {
            res.send(result);
          }
        });
      } else {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      }
    });
  });


  app.post('/api/getUsers/', function(req, res){
    console.log(req.body.offset);
    console.log(req.header('token'));
    try {
      check(req.header('token')).notNull();
      check(req.body.offset).isNumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.length > 0) {
        rmysql.query('SELECT id,CONVERT(AES_DECRYPT(email,"' + salt + '") USING utf8) AS email,first_name,last_name FROM users ORDER BY email DESC LIMIT 20 OFFSET ' + req.body.offset, function(err, result, fields) {
          if(err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to retreive"}');  
          } else {
            res.send(result);
          }
        });
      } else {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      }
    });
  });


  app.get('/api/getUser/:uid', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.length > 0) {
        rmysql.query('SELECT id,CONVERT(AES_DECRYPT(u.email,"' + salt + '") USING utf8) AS email,u.first_name,u.last_name,CONVERT(AES_DECRYPT(u.address,"' + salt + '") USING utf8) AS address,u.city,u.state,u.zipcode,b.amount,b.automatic,b.refillamount,b.minamount,b.cToken FROM users u INNER JOIN balance b ON u.id = b.userid WHERE u.id = ' + rmysql.escape(req.params.uid) , function(err, result, fields){
          if(err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to retreive"}');
          } else {
            res.send(result);
          }       
        });
      } else {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      }  
    });
  });


  app.get('/api/getAdmins/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.length > 0) {
        rmysql.query('SELECT au.id,CONVERT(AES_DECRYPT(u.email,"oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$") USING utf8) AS email,u.first_name,u.last_name,CONVERT(AES_DECRYPT(u.address,"oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$") USING utf8) AS address,u.city,u.state,u.zipcode FROM adminUsers au INNER JOIN users u ON au.userid = u.id', function(err, result, fields){
          if(err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to retreive"}');
          } else {
            res.send(result);
          }    
        });
      } else {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      }
    });    
  });


  app.post('/api/makeAdmin/', function(req, res){
    console.log(req.header('token'));
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.length > 0) {
        rmysql.query('SELECT id FROM users WHERE id = ' + rmysql.escape(req.body.userid), function(err, result, fields) {
          if(result.length > 0) {
            wmysql.query('INSERT INTO adminUsers (userid,password) VALUES(' + wmysql.escape(req.body.userid) + ',"' + req.body.password + '")', function(err, result, fields) {
              if(err || result.affectedRows < 1) {
                res.send('{"status": "failed", "message": "unable to insert"}');  
              } else {
                res.send(result);
              }
            });
          } else {
            res.end('{"status": "failed", "message":"user account does exist"}');
          }
        });
      } else {
        res.end('{"status": "failed", "message":"invalid token"}',401);
      }
    });
  });


  app.post('/api/processBilling/', function(req, res){
    console.log(req.header('token'));
    try {
      check(req.header('token')).notNull();
      check(req.body.gid).isNumeric();
      check(req.body.action).isNumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    wmysql.query('CALL processBilling(' + wmysql.escape(req.header('token')) + ',' + req.body.gid + ',' + req.body.action + ',' + wmysql.escape(req.body.amount) + ')', function(err, result, fields) {
      if(result[0][0].transMess != "success") {
        res.end('{"status": "failed", "message": "' + result[0][0].transMess + '"}');
      } else {
        res.end('{"status": "success"}')
      }
    });
  });
}