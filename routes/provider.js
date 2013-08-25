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
  , util = require('util');

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
var es = require('../lib/elasticsearch');

module.exports = function(app) {

  /*es.indexProvider(22,function(err, obj) {
    //console.log(obj);
    //console.log(err);
  });*/
  
  keywords = ['yoga', 'karate'];
  
  es.search(keywords,'100',37.88,-122.05,function(err,data) {
    //console.log(err)
    console.log(data.hits.hits[0]._id)
  });

  app.post('/api/provider/login/', function(req, res){
    
    var username = req.body.username
    , password = req.body.password;
    
    try {
      check(username).isEmail();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    

    var statement = [
          'SELECT gu.gymid,g.name FROM gymUsers gu INNER JOIN gyms g ON gu.gymid = g.id '
        , 'WHERE gu.username = %s AND gu.password = %s'
    ].join(" ");

    var statement2 = [
          'UPDATE gymUsers SET token = "%s", lastlogin = NOW() '
        , 'WHERE gymid = %s'
    ].join(" ");

    rmysql.query( util.format(statement, wmysql.escape(username), wmysql.escape(password)), function(err, result, fields) {
      if(result.length > 0){
        
        var gymid = result[0].gymid
        , name = result[0].name
        , id = result[0].id;
        
        require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
          console.log("** routes/provider/login **", "result", result);
          
          wmysql.query( util.format(statement2, token, gymid), function(err, result, fields){
            console.log("** routes/provider/login **", "2nd result", result);
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

  app.post('/api/provider/:providerId/imageUpdate/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.providerId).isNumeric();
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
                      es.indexProvider(data.gymid,function(err, obj) { });
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


  app.post('/api/provider/:providerId/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.providerId).isNumeric();
      check(req.body.zipcode).len(5,5).isNumeric()  
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var providerId = req.params.providerId
        , name = req.body.name
        , address = req.body.address
        , city = req.body.city
        , state = req.body.state
        , zipcode = req.body.zipcode
        , phone = req.body.phone
        , email = req.body.email
        , contact = req.body.contact
        , facebook =  req.body.facebook
        , twitter = req.body.twitter
        , googleplus = req.body.googleplus
        , url = req.body.url
        , mondayOpen = req.body.mondayOpen
        , mondayClose = req.body.mondayClose
        , tuesdayOpen = req.body.tuesdayOpen
        , tuesdayClose = req.body.tuesdayClose
        , wednesdayOpen = req.body.wednesdayOpen
        , wednesdayClose = req.body.wednesdayClose
        , thursdayOpen = req.body.thursdayOpen
        , thursdayClose = req.body.thursdayClose
        , fridayOpen = req.body.fridayOpen
        , fridayClose = req.body.fridayClose
        , saturdayOpen = req.body.saturdayOpen
        , saturdayClose = req.body.saturdayClose
        , sundayOpen = req.body.sundayOpen
        , sundayClose = req.body.sundayClose;

        var statement = [
              'UPDATE gyms g set g.name = ' + wmysql.escape(name) + ',g.address = ' + wmysql.escape(address) + ',g.city = ' + wmysql.escape(city) + ','
            , 'g.state = ' + wmysql.escape(state) + ',g.zipcode = ' + zipcode + 'g.lat = ' + lat + ',g.lon = ' + lon + ',g.phone = ' + wmysql.escape(phone) + ','
            , 'g.email = ' + wmysql.escape(email) + ',g.contact = ' + wmysql.escape(contact) + ',g.facebook = ' + wmysql.escape(facebook) + ','
            , 'g.twitter = ' + wmysql.escape(twitter) + ',g.googleplus = ' + wmysql.escape(googleplus) + ',g.url = ' + wmysql.escape(url) + ',g.complete = true '
            , 'WHERE ' + data.groupid + ' = 1 AND g.id = ' + data.gymid
        ].join(" ");

        var statement2 = [
              'UPDATE hours h set mondayOpen = ' + wmysql.escape(mondayOpen) + ',mondayClose = ' + wmysql.escape(mondayClose) + ','
            , 'tuesdayOpen = ' + wmysql.escape(tuesdayOpen) + ',tuesdayClose = ' + wmysql.escape(tuesdayClose) + ', wednesdayOpen = ' + wmysql.escape(wednesdayOpen) + ',wednesdayClose = ' + wmysql.escape(wednesdayClose) + ','
            , 'thursdayOpen = ' + wmysql.escape(thursdayOpen) + ',thursdayClose = ' + wmysql.escape(thursdayClose) + ',fridayOpen = ' + wmysql.escape(fridayOpen) + ',fridayClose = ' + wmysql.escape(fridayClose) + ','
            , 'saturdayOpen = ' + wmysql.escape(saturdayOpen) + ',saturdayClose = ' + wmysql.escape(saturdayClose) + ',sundayOpen = ' + wmysql.escape(sundayOpen) + ',sundayClose = ' + wmysql.escape(sundayClose) + ' '
            , 'WHERE ' + data.groupid + ' = 1 AND h.gymid = ' + data.gymid
        ].join(" ");        

        geo.geocoder(geo.google, address + ',' + city + ',' + state, false,  function(fAddress,lat,lon,details) {
          if(lat) {
            wmysql.query(statement, function(err, result, fields) {
              if(err || result.affectedRows < 1) {
                res.send(400,'{"status": "failed", "message": "update to provider table failed"}');
              }
              es.indexProvider(data.gymid,function(err, obj) { });
            });
          } else {
            res.send(400,'{"status": "failed", "message": "update to convert address to cordinates"}');
          }
        });

        wmysql.query(statement2, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "update to hours table failed"}');
          } else {
            providerObj.id = result.insertId;
            res.send( JSON.stringify(providerObj) );
          } 
        });
      }
    });
  });


  app.post('/api/provider/:providerId/employee/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.providerId).isNumeric();
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

        var username = req.body.username
        , firstName = req.body.firstName
        , lastName = req.body.lastName;

        var statement = [
              'INSERT INTO gymUsers (gymid,token,username,password,first_name,last_name,groupid,lastlogin) '
            , 'SELECT id,"' + token + '",' + wmysql.escape(username) +  ',' + wmysql.escape(firstName) + ',' + wmysql.escape(lastName) + ',0,NOW() '
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


  app.put('/api/provider/:providerId/employee/:employeemployeeId/updatePassword/', function(req, res) {
    try {
      check(req.header('token')).notNull();
      check(req.params.providerId).isNumeric();
      check(req.params.employeeId).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {   

        var npass = req.body.npass
        , cpass = req.body.cpass;

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


  app.del('/api/provider/:providerId/employee/:employeeId/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.providerId).isNumeric();
      check(req.params.employeeId).isNumeric();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var employeeId = req.params.employeeId;

        var statement = [
              'DELETE FROM gymUsers '
            , 'WHERE id = ' + employeeId + ' AND ' + data.groupid + ' = 1 AND gu.gymid = ' + data.gymid 
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "delete of employee row failed"}');
          } else {
            res.send(result);
          }
        });
      }
    });
  });


  app.get('/api/provider/:providerId/balance/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.providerId).isNumeric();
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

  
  app.get('/api/provider/:providerId/disbursement/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.providerId).isNumeric();
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



  app.put('/api/provider/:providerId/disbursement/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.params.providerId).isNumeric();
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


  /*app.get('/api/paymentMethods/', function(req, res){
    rmysql.query('SELECT id,type FROM paymentmethod', function(err, result, fields) {
      if (err || result.length < 1) {
        res.send(400,'{"status": "failed", "message": "unable to retreive payment methods"}');
      } else {
        res.send(result);
      }
    });
  });*/  
}