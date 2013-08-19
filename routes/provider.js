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
var dbConn = require('../lib/mysqlConn');
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

var memcached = require('../lib/memcached');

module.exports = function(app) {

  app.post('/api/provider/login/', function(req, res){
    try {
      check(req.body.username).isEmail();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    var email = wmysql.escape(req.body.email)
    , password = rmysql.escape(req.body.password);

    var statement = [
          'SELECT gu.gymid,g.name FROM gymUsers gu INNER JOIN gyms g ON gu.gymid = g.id '
        , 'WHERE gu.username = ' + username + ' AND gu.password = ' + password
    ].join(" ");

    var statement2 = [
          'UPDATE gymUsers SET token = "' + token + '", lastlogin = NOW() '
        , 'WHERE id = ' + id
    ].join(" ");

    rmysql.query(statement, function(err, result, fields) {
      if(result.length > 0){
        
        var gymid = result[0].gymid
        , name = result[0].name
        , id = result[0].id;

        require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
          
          wmysql.query(statement2, function(err, result, fields){
            if(err || result.affectedRows < 1) {
              res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
            } else {
              memcached.setMemAuth(token, function(err, data) {});
              res.send('{"gymid": "' + gymid + '", "name": "' + name + '", "token": "' + token + '"}');
            }
          });
        });
      } else {
        res.send(401,'{"status": "failed", "message": "username and password does not match any existing record"}');
       }
     });
  });


  app.get('/api/provider/logout/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var statement = [
              'UPDATE gymUsers SET token = null '
            , 'WHERE id = ' + data.id
        ].join(" ");  

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}'); 
          } else {
            memcached.remMemKey(req.header('token'));
            res.send(result);
          }
        });
      }
    });
  });

  app.post('/api/provider/:pid/imageUpdate/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.image).notNull(); 
      check(req.body.iName).isAlphanumeric(); 
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var iName = req.body.iName
        , image = req.body.image;

        var statement = [
              'UPDATE gyms g SET g.image = ' + wmysql.escape(CFcontainer + iName) + ' '
            , 'WHERE ' + data.groupid + ' = 1 AND g.id = ' + data.gymid
        ].join(" ");

        fs.writeFile('images/' + req.body.iName, new Buffer(req.body.image, "base64"), function(err) {
          CFclient.setAuth(function (err) {
            if(err) {
              res.send(400,'{"status": "failed", "message": "image upload failed: ' + err + '"}');
            } else {
              CFclient.addFile('gymImages', { remote: req.body.iName, local: 'images/' + req.body.iName }, function (err, uploaded) {
                if(err) {
                  res.send(400,'{"status": "failed", "message": "image upload failed: ' + err + '"}');
                } else {
                  wmysql.query(statement, function(err, result, fields) {
                    if(err || result.affectedRows < 1) {
                      res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}'); 
                    } else {
                      res.send('{"path": "' + CFcontainer + req.body.iName + '"}');
                    }
                  });
                }
              });
            }
          });
        });
      }
    });
  });


  app.post('/api/provider/:pid/update/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.pid).isNumeric();
      check(req.body.zipcode).len(5,5).isNumeric()  
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var pid = req.params.pid
        , name = wmysql.escape(req.body.name)
        , address = wmysql.escape(req.body.address)
        , city = wmysql.escape(req.body.city)
        , state = wmysql.escape(req.body.state)
        , zipcode = req.body.zipcode
        , phone = wmysql.escape(req.body.phone)
        , email = wmysql.escape(req.body.email)
        , contact = wmysql.escape(req.body.contact)
        , facebook =  wmysql.escape(req.body.facebook)
        , twitter = wmysql.escape(req.body.twitter)
        , googleplus = wmysql.escape(req.body.googleplus)
        , url = wmysql.escape(req.body.url)
        , mondayOpen = wmysql.escape(req.body.mondayOpen)
        , mondayClose = wmysql.escape(req.body.mondayClose)
        , tuesdayOpen = wmysql.escape(req.body.tuesdayOpen)
        , tuesdayClose = wmysql.escape(req.body.tuesdayClose)
        , wednesdayOpen = wmysql.escape(req.body.wednesdayOpen)
        , wednesdayClose = wmysql.escape(req.body.wednesdayClose)
        , thursdayOpen = wmysql.escape(req.body.thursdayOpen)
        , thursdayClose = wmysql.escape(req.body.thursdayClose)
        , fridayOpen = wmysql.escape(req.body.fridayOpen)
        , fridayClose = wmysql.escape(req.body.fridayClose)
        , saturdayOpen = wmysql.escape(req.body.saturdayOpen)
        , saturdayClose = wmysql.escape(req.body.saturdayClose)
        , sundayOpen = wmysql.escape(req.body.sundayOpen)
        , sundayClose = wmysql.escape(req.body.sundayClose);

        var statement = [
              'UPDATE gyms g set g.name = ' + name + ',g.address = ' + address + ',g.city = ' + city + ','
            , 'g.state = ' + state + ',g.zipcode = ' + zipcode + ',g.phone = ' + phone + ','
            , 'g.email = ' + email + ',g.contact = ' + contact + ',g.facebook = ' + facebook + ','
            , 'g.twitter = ' + twitter + ',g.googleplus = ' + googleplus + ',g.url = ' + url + ',g.complete = true '
            , 'WHERE ' + data.groupid + ' = 1 AND g.id = ' + data.gymid
        ].join(" ");

        var statement2 = [
              'UPDATE hours h set mondayOpen = ' + mondayOpen + ',mondayClose = ' + mondayClose + ','
            , 'tuesdayOpen = ' + tuesdayOpen + ',tuesdayClose = ' + tuesdayClose + ', wednesdayOpen = ' + wednesdayOpen + ',wednesdayClose = ' + wednesdayClose + ','
            , 'thursdayOpen = ' + thursdayOpen + ',thursdayClose = ' + thursdayClose + ',fridayOpen = ' + fridayOpen + ',fridayClose = ' + fridayClose + ','
            , 'saturdayOpen = ' + saturdayOpen + ',saturdayClose = ' + saturdayClose + ',sundayOpen = ' + sundayOpen + ',sundayClose = ' + sundayClose + ' '
            , 'WHERE ' + data.groupid + ' = 1 AND h.gymid = ' + data.gymid
        ].join(" ");        

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "update to row failed"}');
          } else {
            wmysql.query(statement2, function(err, result, fields) {
              if(err || result.affectedRows < 1) {
                res.send(400,'{"status": "failed", "message": "update to hours table failed"}');
              } else {
                geo.geocoder(geo.google, address + ',' + city + ',' + state, false,  function(fAddress,lng,lat) {
                  cordinatesModel.findOne({gymid: pid}, function(err, p) {
                    if(!p) {
                      var gymLoc = new cordinatesModel({ gymid: pid, loc: {lat: lat, lng: lng }});
                        gymLoc.save(function (err) {
                          if(err)
                            res.send(400,'{"status": "failed", "message": "geo cordinates update failed: ' + err + '"}');
                          else   
                            res.send(result);
                        });
                      } else { 
                        p.loc.lat = lat;
                        p.loc.lng = lng;  
                        p.save(function(err) {
                          if(err) 
                            res.send(400,'{"status": "failed", "message": "geo cordinates update failed: ' + err + '"}');
                          else
                            res.send(result);
                        });
                      }
                    });
                  });
                } 
            });
          } 
        });
      }
    });
  });


  app.post('/api/provider/:pid/employee/add/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.username).len(1,12).isAlphanumeric()
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 
        require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
        });

        var username = wmysql.escape(req.body.username),
        , firstName = wmysql.escape(req.body.firstName),
        , lastName = wmysql.escape(req.body.lastName);

        var statement = [
              'INSERT INTO gymUsers (gymid,token,username,password,first_name,last_name,groupid,lastlogin) '
            , 'SELECT id,"' + token + '",' + username +  ',' + firstName + ',' + lastName + ',0,NOW() '
            , 'FROM gyms g WHERE ' + data.groupid + ' = 1 AND g.id = ' + data.gymid
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "adding employee row failed"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });


  app.put('/api/provider/:pid/employee/:eid/updatePassword/', function(req, res) {
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {   

        var npass = wmysql.escape(req.body.npass)
        , cpass = wmysql.escape(req.body.cpass)

        var statement = [
              'SELECT password FROM gymUsers '
            , 'WHERE id = ' + data.id
        ].join(" ");

        var statement2 = [
              'UPDATE gymUsers SET password = ' + wmysql.escape(req.body.npass) + ' '
            , 'WHERE id = ' + data.id
        ].join(" ");

        rmysql.query(statement, function(err, result, fields) {
          if(result.password == req.body.cpass) {
            wmysql.query(statement2, function(err, result, fields) {
              if(err || result.affectedRows < 1) {
                res.send(400,'{"status": "failed", "message": "update to employee table failed"}');
              } else {
                res.send(result);
              }
            });
          } else {
            res.send(400,'{"status": "failed", "message":"Incorrect current password"}');
          }
        });
      }
    });
  });


  app.post('/api/provider/:pid/employee/:eid/delete/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.eid).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var statement = [
              'SELECT id FROM gymUsers '
            , 'WHERE groupid = 1 AND id = ' + data.id
        ].join(" ");

        var statement2 = [
              'DELETE FROM gymUsers '
            , 'WHERE id = ' + data.id
        ].join(" ");

        rmysql.query(statement, function(err, result, fields) {
          if(result.length > 0) {
            wmysql.query(statement2, function(err, result, fields) {
              if(err || result.affectedRows < 1) {
                res.send(400,'{"status": "failed", "message": "delete of employee row failed"}');
              } else {
                res.send(result);
              }
            });
          }
        });
      }
    });
  });


  app.get('/api/gymBalance/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {

        var statement = [
              'SELECT balance '
            , 'FROM gymBilling gb '
            , 'WHERE gb.gid = ' + data.gymid
        ].join(" ");

        rmysql.query(statement, function(err, result, fields) {
          if(err || result.length < 1) {
            res.send(400,'{"status": "failed", "message": "unable to retrieve balance"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });


  /*app.post('/api/gymSchedule/', function(req, res){
    try {
      check(req.header('token')).notNull();

    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {
        rmysql.query('SELECT c.id,ct.weekday,ct.time,c.service,c.duration,c.spots from classes c INNER JOIN classTimes ct ON c.id = ct.classid INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE g.id = ' + data.gymid + ' ORDER BY FIELD(weekday,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")', function(err, result, fields) {
          if(err || result.length < 1) {
            res.send(400,'{"status": "failed", "message": "unable to retrieve schedule"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });*/

  
  app.get('/api/disbursement/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {

        var statement = [
              'SELECT d.paymenttype,d.paylimit,d.type '
            , 'FROM disbursement d WHERE d.gymid = ' + data.gymid
        ].join(" ");

        rmysql.query(statement, function(err, result, fields) {
          if (err || result.length < 1) {
            res.send(400,'{"status": "failed", "message": "unable to retrieve disbursement"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });



  app.put('/api/updateDisbursement/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.paymenttype).isNumeric()
      check(req.body.type).isNumeric()
      check(req.body.paylimit).isDecimal();
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {   

        var paymenttype = req.body.paymenttype
        , paylimit = req.body.paylimit
        , type = req.body.type;

        var statement = [
              'UPDATE disbursement d '
            , 'SET d.paymenttype = ' + paymenttype + ',d.paylimit = ' + paylimit + ',d.type = ' + type + ' '
            , 'WHERE ' + data.groupid + ' = 1 AND d.gymid = ' + data.gymid
        ].join(" ");


        wmysql.query(statement, function(err, result, fields) {
          if (err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "update to disbursement row failed"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });


  /*app.get('/api/getTags/:gid', function(req, res){
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
  });*/  


  app.get('/api/paymentMethods/', function(req, res){
    rmysql.query('SELECT id,type FROM paymentmethod', function(err, result, fields) {
      if (err || result.length < 1) {
        res.send(400,'{"status": "failed", "message": "unable to retreive payment methods"}');
      } else {
        res.send(result);
      }
    });
  });  
}