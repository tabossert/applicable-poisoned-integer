/**
 *  Routes related to providers
 */

var config = config = require('config')
  , moment = require('moment')
  , fs = require("fs")
  , path = require("path")
  , crypto = require('crypto')
  , mongoose = require("mongoose")
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , Memcached = require('memcached');

// API config settings
var salt = config.Hash.salt;

//DB
var dbConn = require('../mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;

var cloudfiles = require('cloudfiles');
var CFconfig = {
  auth: {
    username: config.CloudFiles.username,
    apiKey: config.CloudFiles.apiKey,
    host : config.CloudFiles.host
  }
};

var CFcontainer = config.CloudFiles.CFcontainer;
var CFclient = cloudfiles.createClient(CFconfig);

var memcached = new Memcached('127.0.0.1:11211');

module.exports = function(app) {


  function remMemAuth(token) {
    console.log('remove');
    memcached.del(token, function (err) {
    });
  }

  function setMemAuth(token,callback) {
    console.log('set');
    rmysql.query('SELECT gymid FROM gymUsers WHERE token = ' + rmysql.escape(token), function(err, result, fields){
      console.log(result.length)
      if(result.length < 1) {
        callback('no result', null)
      } else {
        memcached.set(token, result[0].gymid, 900, function (err) {
          if(err) {
            callback(null,result[0].gymid);
          }
          callback(null,result[0].gymid);
        });   
      }     
    });    
  }

  function isMemAuth(token,callback) {
    console.log('get');
    memcached.get(token, function (err, data) {
      if(data == false) {
        console.log(err);
        setMemAuth(token, function(err,data) {
          if(err) {
            callback(err,null)
          }
          callback(null,data);
        });
      } else {
        callback(null,data);
      }
    });    
  }

  app.post('/api/gymLogin/', function(req, res){
    try {
      check(req.body.username).len(1,12).isAlphanumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gu.gymid,g.name FROM gymUsers gu INNER JOIN gyms g ON gu.gymid = g.id WHERE gu.username = "' + rmysql.escape(req.body.username) + '" AND gu.password = ' + rmysql.escape(req.body.password), function(err, result, fields) {
      if(result.length > 0){
        var gymid = result[0].gymid;
        var name = result[0].name;
        require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
          wmysql.query('UPDATE gymUsers SET token = "' + token + '", lastlogin = NOW() WHERE username = "' + wmysql.escape(req.body.username) + '"', function(err, result, fields){
            if(err || result.affectedRows < 1) {
              res.end('[{"status": "failed", "message": "update to employee row failed"}]',400);
            } else {
              res.end('[{"status": "success", "gymid": "' + gymid + '", "name": "' + name + '", "token": "' + token + '"}]');
            }
          });
        });
      } else {
        res.end('[{"status": "failed", "message": "username and password does not match any existing record"}]');
       }
     });
  });


  app.get('/api/gymLogout/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}',400);
      return;
    }
    wmysql.query('UPDATE gymUsers SET token = null WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.send(401,'{"status": "failed", "message": "invalid token"}'); 
      } else {
        remMemAuth(req.header('token'));
        res.end('{"status": "success"}');
      }
    });
  });

  app.post('/api/addGymImage/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.image).notNull(); 
      check(req.body.iName).isAlphanumeric(); 
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}',400);
      return;
    }
    fs.writeFile('images/' + req.body.iName, new Buffer(req.body.image, "base64"), function(err) {
      CFclient.setAuth(function (err) {
        if(err) {
          res.end('{"status": "failed", "message": "image upload failed: ' + err + '"}',400);
        } else {
          CFclient.addFile('gymImages', { remote: req.body.iName, local: 'images/' + req.body.iName }, function (err, uploaded) {
            if(err) {
              res.end('{"status": "failed", "message": "image upload failed: ' + err + '"}');
            } else {
              wmysql.query('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid SET g.image = ' + wmysql.escape(CFcontainer + req.body.iName) + ' WHERE gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
                if(err || result.affectedRows < 1) {
                  res.end('{"status": "failed", "message": "row update failed or token invalid"}',400); 
                } else {
                  res.end('{"status": "success", "path": "' + CFcontainer + req.body.iName + '"}');
                }
              });
            }
          });
        }
      });
    });
  });


  app.post('/api/updateGymProfile/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.gid).isNumeric();
      check(req.body.zipcode).len(5,5).isNumeric()  
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}',400);
      return;
    }
    wmysql.query('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid set g.name = ' + wmysql.escape(req.body.name) + ',g.address = ' + wmysql.escape(req.body.address) + ',g.city = ' + wmysql.escape(req.body.city) + ',g.state = ' + wmysql.escape(req.body.state) + ',g.zipcode = ' + req.body.zipcode + ',g.phone = ' + req.body.phone + ',g.email = ' + wmysql.escape(req.body.email) + ',g.contact = ' + wmysql.escape(req.body.contact) + ',g.facebook = ' + wmysql.escape(req.body.facebook) + ',g.twitter = ' + wmysql.escape(req.body.twitter) + ',g.googleplus = ' + wmysql.escape(req.body.googleplus) + ',g.url = ' + wmysql.escape(req.body.url) + ',g.complete = true WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "update to row failed or invalid token"}',400);
      } else {
        wmysql.query('UPDATE hours h INNER JOIN gymUsers gu ON h.gymid = gu.gymid set mondayOpen = ' + wmysql.escape(req.body.mondayOpen) + ',mondayClose = ' + wmysql.escape(req.body.mondayClose) + ',tuesdayOpen = ' + wmysql.escape(req.body.tuesdayOpen) + ',tuesdayClose = ' + wmysql.escape(req.body.tuesdayClose) + ', wednesdayOpen = ' + wmysql.escape(req.body.wednesdayOpen) + ',wednesdayClose = ' + wmysql.escape(req.body.wednesdayClose) + ',thursdayOpen = ' + wmysql.escape(req.body.thursdayOpen) + ',thursdayClose = ' + wmysql.escape(req.body.thursdayClose) + ',fridayOpen = ' + wmysql.escape(req.body.fridayOpen) + ',fridayClose = ' + wmysql.escape(req.body.fridayClose) + ',saturdayOpen = ' + wmysql.escape(req.body.saturdayOpen) + ',saturdayClose = ' + wmysql.escape(req.body.saturdayClose) + ',sundayOpen = ' + wmysql.escape(req.body.sundayOpen) + ',sundayClose = ' + wmysql.escape(req.body.sundayClose) + ' WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message": "update to hours table failed"}',400);
          } else {
            geo.geocoder(geo.google, req.body.address + ',' + req.body.city + ',' + req.body.state, false,  function(fAddress,lng,lat) {
              cordinatesModel.findOne({gymid: req.body.gid}, function(err, p) {
                if(!p) {
                  var gymLoc = new cordinatesModel({ gymid: req.body.gid, loc: {lat: lat, lng: lng }});
                    gymLoc.save(function (err) {
                      if(err)
                        res.end('{"status": "failed", "message": "geo cordinates update failed: ' + err + '"}',400);
                      else   
                        res.end('{"status": "success"}');
                    });
                  } else { 
                    p.loc.lat = lat;
                    p.loc.lng = lng;  
                    p.save(function(err) {
                      if(err) 
                        res.end('{"status": "failed", "message": "geo cordinates update failed: ' + err + '"}',400);
                      else
                        res.end('{"status": "success"}');
                    });
                  }
                });
              });
            } 
        });
      } 
    });
  });


  app.post('/api/addGymUser/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.username).len(1,12).isAlphanumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}',400);
      return;
    }
    require('crypto').randomBytes(48, function(ex, buf) {
      var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    });
    wmysql.query('INSERT INTO gymUsers (gymid,token,username,password,first_name,last_name,groupid,lastlogin) SELECT id,"' + token + '",' + wmysql.escape(req.body.username) +  ',' + wmysql.escape(req.body.firstName) + ',' + wmysql.escape(req.body.lastName) + ',0,NOW() FROM gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid WHERE gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "adding employee row failed"}',400);
      } else {
        res.end('{"status": "success"}');
      }
    });
  });


  app.put('/api/updateGymUser/', function(req, res) {
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}',400);
      return;
    }
    rmysql.query('SELECT password FROM gymUsers WHERE token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.password == req.body.cpass) {
        wmysql.query('UPDATE gymUsers set password = ' + wmysql.escape(req.body.npass) + ' WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message": "update to employee table failed"}');
          } else {
            res.end('{"status": "success"}');
          }
        });
      } else {
        res.end('{"status": "failed", "message":"Incorrect current password"}');
      }
    });
  });


  app.post('/api/deleteGymUser/', function(req, res){
    rmysql.query('SELECT id FROM gymUsers WHERE groupid = 1 AND token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.length > 0) {
        wmysql.query('DELETE FROM gymUsers WHERE id = ' + req.body.eid, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message": "delete of employee row failed or invalid token"}');
          } else {
            res.end('{"status": "success"}');
          }
        });
      }
    });
  });


  app.get('/api/gymBalance/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      }
      rmysql.query('SELECT balance FROM gymBilling gb WHERE gb.gid = ' + data, function(err, result, fields) {
        if(err || result.length < 1) {
          res.end('{"status": "failed", "message": "unable to retrieve balance or invalid token"}');
        } else {
          res.send(result);
        }
      });
    });
  });


  app.post('/api/gymSchedule/', function(req, res){
    try {
      check(req.header('token')).notNull();
      //check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      //check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
      rmysql.query('SELECT c.id,ct.weekday,ct.time,c.service,c.duration,c.spots from classes c INNER JOIN classTimes ct ON c.id = ct.classid INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = ' + rmysql.escape(req.header('token')) + ' ORDER BY FIELD(weekday,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")', function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "unable to retrieve schedule or invalid token"}');
      } else {
        res.send(result);
      }
    });
  });

  
  app.get('/api/disbursement/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT d.paymenttype,d.paylimit,d.type FROM disbursement d INNER JOIN gymUsers gu ON (d.gymid = gu.gymid) WHERE gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if (err || result.length < 1) {
        res.end('{"status": "failed", "message": "unable to retrieve disbursement or invalid token"}');
      } else {
        res.send(result);
      }
    });
  });



  app.put('/api/updateDisbursement/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.paymenttype).isNumeric()
      check(req.body.type).isNumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    wmysql.query('UPDATE disbursement d INNER JOIN gymUsers gu ON d.gymid = gu.gymid set d.paymenttype = ' + rmysql.escape(req.body.paymenttype) + ',d.paylimit = ' + rmysql.escape(req.body.paylimit) + ',d.type = ' + rmysql.escape(req.body.type) + ' WHERE gu.groupid = 1 AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if (err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "update to disbursement row failed or invalid token"}');
      } else {
        res.end('{"status": "success"}');
      }
    });
  });


  app.get('/api/getTags/:gid', function(req, res){
    rmysql.query('SELECT id,tag FROM gymTags WHERE gymid = ' + req.params.gid, function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message":"unable to retrieve tags"}');
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
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
      if(err || result.length < 1) { 
        res.end('{"status": "failed", "message":"invalid token"}',401);
      } else {
        wmysql.query('INSERT INTO gymTags (gymid,tag) VALUES (' + wmysql.escape(req.body.gymid) + ',' + wmysql.escape(req.body.tag) + ')', function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message":"insert of tag row failed"}');
          } else {
            res.end('{"status": "success", "tid": "' + result.insertId + '"}');
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
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
      if(err || result.length < 1) { 
        res.end('{"status": "failed", "message":"invalid token"}',401);
      } else {
        wmysql.query('DELETE FROM gymTags WHERE id = ' + req.body.tid, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message":"unable to delete tag"}');
          } else {
            res.end('{"status": "success"');
          }
        });
      }
    });
  });  


  app.get('/api/paymentMethods/', function(req, res){
    rmysql.query('SELECT id,type FROM paymentmethod', function(err, result, fields) {
      if (err || result.length < 1) {
        res.end('{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
      }
    });
  });  
}