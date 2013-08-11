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
  , sanitize = require('validator').sanitize;

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


module.exports = function(app) {

  app.post('/api/addGym/', function(req, res){
    try {
      check(req.body.username).len(1,12).isAlphanumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    require('crypto').randomBytes(48, function(ex, buf) {
      var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
      wmysql.query('INSERT INTO gyms (name) VALUES(' + wmysql.escape(req.body.name) +')', function(err, result, fields) {
       if(err || result.affectedRows < 1) {
          res.end('{"status": "failed", "message": "unable to add gym"}');
        } else {
          var gymid = result.insertId;
          wmysql.query('INSERT INTO gymUsers (gymid,username,password,first_name,last_name,groupid,token) VALUES(' + gymid +',"' + req.body.username + '",' + wmysql.escape(req.body.password) + ',' + wmysql.escape(req.body.firstName) + ',' + wmysql.escape(req.body.lastName) + ',1,"' + token + '")', function(err, result, fields) {
            if(err || result.affectedRows < 1) {
              res.end('{"status": "failed", "message": "unable to add gym user"}');
            } else {
              wmysql.query('INSERT INTO classes (gymid,service,duration,price,datetime,status,daypass) VALUES(' + gymid + ',"Day Pass",0,0,NOW(),0,1)', function(err, result, fields) {
                if(err || result.affectedRows < 1) {
                  res.end('{"status": "failed", "message": "unable to add day pass class"}');
                } else {
                  wmysql.query('INSERT INTO disbursement (gymid,paymenttype,paylimit,type) SELECT id,1,300,1 FROM gyms WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
                    if (err || result.affectedRows < 1) {
                      res.end('{"status": "failed", "message": "unable to update disbursement"}');
                    } else {
                      res.end('{"status": "success"}');
                    }
                  });
                }
              });  
            }
          }); 
        }
      });
    });
  });


  app.post('/api/gymLogin/', function(req, res){
    try {
      //check(req.body.username).len(1,12).isAlphanumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gu.gymid,g.name FROM gymUsers gu INNER JOIN gyms g ON gu.gymid = g.id WHERE gu.username = "' + req.body.username + '" AND gu.password = ' + rmysql.escape(req.body.password), function(err, result, fields) {
      if(result.length > 0){
        var gymid = result[0].gymid;
        var name = result[0].name;
        console.log(gymid);
        require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
          wmysql.query('UPDATE gymUsers SET token = "' + token + '", lastlogin = NOW() WHERE username = "' + req.body.username + '"', function(err, result, fields){
            if(err || result.affectedRows < 1) {
              res.end('[{"status": "failed", "message": "Unable to update"}]');
            } else {
              res.end('[{"status": "success", "gymid": "' + gymid + '", "name": "' + name + '", "token": "' + token + '"}]');
            }
          });
        });
      } else {
        res.end('[{"status": "failed", "message": "no gym found"}]');
       }
     });
  });


  app.get('/api/gymLogout/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    wmysql.query('UPDATE gymUsers SET token = null WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "unable to logout"}'); 
      } else {
        res.end('{"status": "success"}');
      }
    });
  });

  app.post('/api/addGymImage/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.image).notNull();  
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    fs.writeFile('images/' + req.body.iName, new Buffer(req.body.image, "base64"), function(err) {
      CFclient.setAuth(function (err) {
        if(err) {
          res.end('{"status": "failed", "message": "unable to upload"}');
        } else {
          CFclient.addFile('gymImages', { remote: req.body.iName, local: 'images/' + req.body.iName }, function (err, uploaded) {
            if(err) {
              res.end('{"status": "failed", "message": "unable to upload"}');
            } else {
              wmysql.query('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid SET g.image = "' + CFcontainer + req.body.iName + '" WHERE gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
                if(err || result.affectedRows < 1) {
                  res.end('{"status": "failed", "message": "unable to update"}'); 
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
      //check(req.body.phone).len(10,10).isNumeric()
      //check(req.body.email).isEmail()
      check(req.body.zipcode).len(5,5).isNumeric()  
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    console.log('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid set g.name = ' + wmysql.escape(req.body.name) + ',g.address = ' + wmysql.escape(req.body.address) + ',g.city = ' + wmysql.escape(req.body.city) + ',g.state = ' + wmysql.escape(req.body.state) + ',g.zipcode = ' + req.body.zipcode + ',g.phone = ' + req.body.phone + ',g.email = ' + wmysql.escape(req.body.email) + ',g.contact = ' + wmysql.escape(req.body.contact) + ',g.image = ' + wmysql.escape(req.body.image) + ',g.facebook = ' + wmysql.escape(req.body.facebook) + ',g.twitter = ' + wmysql.escape(req.body.twitter) + ',g.googleplus = ' + wmysql.escape(req.body.googleplus) + ',g.url = ' + wmysql.escape(req.body.url) + ',g.complete = true WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')));
    wmysql.query('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid set g.name = ' + wmysql.escape(req.body.name) + ',g.address = ' + wmysql.escape(req.body.address) + ',g.city = ' + wmysql.escape(req.body.city) + ',g.state = ' + wmysql.escape(req.body.state) + ',g.zipcode = ' + req.body.zipcode + ',g.phone = ' + req.body.phone + ',g.email = ' + wmysql.escape(req.body.email) + ',g.contact = ' + wmysql.escape(req.body.contact) + ',g.facebook = ' + wmysql.escape(req.body.facebook) + ',g.twitter = ' + wmysql.escape(req.body.twitter) + ',g.googleplus = ' + wmysql.escape(req.body.googleplus) + ',g.url = ' + wmysql.escape(req.body.url) + ',g.complete = true WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "unable to update gym"}');
      } else {
        console.log('UPDATE hours h INNER JOIN gymUsers gu ON h.gymid = gu.gymid set mondayOpen = "' + wmysql.escape(req.body.mondayOpen) + '",mondayClose = "' + wmysql.escape(req.body.mondayClose) + '",tuesdayOpen = "' + wmysql.escape(req.body.tuesdayOpen) + '",tuesdayClose = "' + wmysql.escape(req.body.tuesdayClose) + '", wednesdayOpen = "' + wmysql.escape(req.body.wednesdayOpen) + '",wednesdayClose = "' + wmysql.escape(req.body.wednesdayClose) + '",thursdayOpen = "' + wmysql.escape(req.body.thursdayOpen) + '",thursdayClose = "' + wmysql.escape(req.body.thursdayClose) + '",fridayOpen = "' + wmysql.escape(req.body.fridayOpen) + '",fridayClose = "' + wmysql.escape(req.body.fridayClose) + '",saturdayOpen = "' + wmysql.escape(req.body.saturdayOpen) + '",saturdayClose = "' + wmysql.escape(req.body.saturdayClose) + '",sundayOpen = "' + wmysql.escape(req.body.sundayOpen) + '",sundayClose = "' + wmysql.escape(req.body.sundayClose) + '" WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')));
        wmysql.query('UPDATE hours h INNER JOIN gymUsers gu ON h.gymid = gu.gymid set mondayOpen = ' + wmysql.escape(req.body.mondayOpen) + ',mondayClose = ' + wmysql.escape(req.body.mondayClose) + ',tuesdayOpen = ' + wmysql.escape(req.body.tuesdayOpen) + ',tuesdayClose = ' + wmysql.escape(req.body.tuesdayClose) + ', wednesdayOpen = ' + wmysql.escape(req.body.wednesdayOpen) + ',wednesdayClose = ' + wmysql.escape(req.body.wednesdayClose) + ',thursdayOpen = ' + wmysql.escape(req.body.thursdayOpen) + ',thursdayClose = ' + wmysql.escape(req.body.thursdayClose) + ',fridayOpen = ' + wmysql.escape(req.body.fridayOpen) + ',fridayClose = ' + wmysql.escape(req.body.fridayClose) + ',saturdayOpen = ' + wmysql.escape(req.body.saturdayOpen) + ',saturdayClose = ' + wmysql.escape(req.body.saturdayClose) + ',sundayOpen = ' + wmysql.escape(req.body.sundayOpen) + ',sundayClose = ' + wmysql.escape(req.body.sundayClose) + ' WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message": "unable to update hours"}');
          } else {
          /*wmysql.query('UPDATE disbursement d INNER JOIN gymUsers gu set d.paymenttype = ' + wmysql.escape(req.body.paymenttype) + ',d.paylimit = ' + wmysql.escape(req.body.limit) + ',d.type = ' + wmysql.escape(req.body.type) + ' WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
              if(err || result.length < 1) {
                res.end('{"status": "failed", "message": "unable to update disbursement"}');
              } else {*/
            geo.geocoder(geo.google, req.body.address + ',' + req.body.city + ',' + req.body.state, false,  function(fAddress,lng,lat) {
              cordinatesModel.findOne({gymid: req.body.gid}, function(err, p) {
                if(!p) {
                  var gymLoc = new cordinatesModel({ gymid: req.body.gid, loc: {lat: lat, lng: lng }});
                    gymLoc.save(function (err) {
                      if(err)
                        res.end('{"status": "failed", "message": "Unable to add geo cordinates"}');
                      else   
                        res.end('{"status": "success"}');
                    });
                  } else { 
                    p.loc.lat = lat;
                    p.loc.lng = lng;  
                    p.save(function(err) {
                      if(err) 
                        res.end('{"status": "failed", "message": "Unable to update geo cordinates"}');
                      else
                        res.end('{"status": "success"}');
                    });
                  }
                });
              });
            } 
            /*});
          }*/
        });
      } 
    });
  });


  app.post('/api/addGymUser/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.username).len(1,12).isAlphanumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    require('crypto').randomBytes(48, function(ex, buf) {
      var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    });
    wmysql.query('INSERT INTO gymUsers (gymid,token,username,password,first_name,last_name,groupid,lastlogin) SELECT id,"' + token + '","' + req.body.username +  '",' + wmysql.escape(req.body.firstName) + ',' + wmysql.escape(req.body.lastName) + ',0,NOW() FROM gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid WHERE gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "unable to add gym user"}');
      } else {
        res.end('{"status": "success"}');
      }
    });
  });


  app.post('/api/updateGymEmployee/', function(req, res) {
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT password FROM gymUsers WHERE token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(result.password == req.body.cpass) {
        wmysql.query('UPDATE gymUsers set password = "' + req.body.npass + '" WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message": "unable to update gym user"}');
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
            res.end('{"status": "failed", "message": "unable to delete gym user"}');
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
    rmysql.query('SELECT balance FROM gymBilling gb INNER JOIN gymUsers gu ON gb.gid = gu.gymid WHERE gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
      }
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
        res.end('{"status": "failed", "message": "unable to retrieve"}');
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
        res.end('{"status": "failed", "message": "no gym matched"}');
      } else {
        res.send(result);
      }
    });
  });



  app.post('/api/updateDisbursement/', function(req, res){
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
        res.end('{"status": "failed", "message": "unable to update"}');
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
      check(req.body.gymid).isNumeric() 
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
      if(err || result.length < 1) { 
        res.end('{"status": "failed", "message":"invalid token"}',401);
      } else {
        wmysql.query('INSERT INTO gymTags (gymid,tag) VALUES (' + req.body.gymid + ',' + wmysql.escape(req.body.tag) + ')', function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.end('{"status": "failed", "message":"unable to add tag"}');
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