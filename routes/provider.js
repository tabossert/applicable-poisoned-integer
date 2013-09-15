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
  , errMsg = require('../lib/errMsg')
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

module.exports = function(app) {

  var login = function(req, res){
    
    var username = req.body.username
    , password = req.body.password;
    
    try {
      check(username, errMsg.emailErr).isEmail();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }

    

    var statement = [
          'SELECT e.providerid,p.name FROM employees e INNER JOIN providers p ON e.providerid = p.id '
        , 'WHERE e.username = %s AND e.password = %s'
    ].join(" ");

    var statement2 = [
          'UPDATE employees SET token = "%s", lastlogin = NOW() '
        , 'WHERE providerid = %s'
    ].join(" ");

    rmysql.query( util.format(statement, wmysql.escape(username), wmysql.escape(password)), function(err, result, fields) {
      console.log(result)
      if(result && result.length > 0){
        
        var providerid = result[0].providerid
        , name = result[0].name
        , id = result[0].id;

        var providerObj = {};
        providerObj.employeeId = id;
        providerObj.name = name;
        providerObj.providerId = providerid;
        
        require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
          console.log("** routes/provider/login **", "result", result);
          
          wmysql.query( util.format(statement2, token, providerid), function(err, result, fields){
            console.log("** routes/provider/login **", "2nd result", result);
            if(err || result.affectedRows < 1) {
              res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}');
            } else {
              providerObj.token = token;
              memcached.setMemAuth(token, function(err, data) {});
              res.send( JSON.stringify(providerObj) );
            }
          });
        });
      } else {
        res.send(401,'{"status": "failed", "message": "username and password does not match any existing record"}');
       }
     });
  };
  
  ['put', 'post'].forEach(function (method) {
    app[method]('/api/provider/login/', login);
  });


  var logout = function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
    } catch (e) {
      res.send(400,'{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else { 

        var statement = [
              'UPDATE employees SET token = null '
            , 'WHERE id = ' + data.id
        ].join(" ");  

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "sql error occured: ' + err + '"}'); 
          } else {
            memcached.remMemKey(req.header('token'));
            res.send( result );
          }
        });
      }
    });
  };
  
  ['put', 'post'].forEach(function (method) {
    app[method]('/api/provider/logout/', logout);
  });


  app.post('/api/provider/:providerId/imageUpdate/', function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
      check(req.params.providerId, errMsg.providerIdErr).isNumeric();
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
              'UPDATE providers p SET p.image = ' + wmysql.escape(CFcontainer + iName) + ' '
            , 'WHERE ' + data.groupid + ' = 1 AND p.id = ' + data.providerid
        ].join(" ");

        fs.writeFile('images/' + req.body.iName, new Buffer(req.body.image, "base64"), function(err) {
          CFclient.setAuth(function (err) {
            if(err) {
              res.send(400,'{"status": "failed", "message": "image upload failed: ' + err + '"}');
            } else {
              CFclient.addFile('providerImages', { remote: req.body.iName, local: 'images/' + req.body.iName }, function (err, uploaded) {
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


  app.post('/api/provider/:providerId', function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
      check(req.params.providerId, errMsg.providerIdErr).isNumeric();
      check(req.body.zipcode, errMsg.zipcodeErr).len(5,5).isNumeric()  
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
              'UPDATE providers p set p.name = ' + wmysql.escape(name) + ',p.address = ' + wmysql.escape(address) + ',p.city = ' + wmysql.escape(city) + ','
            , 'p.state = ' + wmysql.escape(state) + ',p.zipcode = ' + zipcode + ',p.phone = ' + wmysql.escape(phone) + ','
            , 'p.email = ' + wmysql.escape(email) + ',p.contact = ' + wmysql.escape(contact) + ',p.facebook = ' + wmysql.escape(facebook) + ','
            , 'p.twitter = ' + wmysql.escape(twitter) + ',p.googleplus = ' + wmysql.escape(googleplus) + ',p.url = ' + wmysql.escape(url) + ',p.complete = true '
            , 'WHERE ' + data.groupid + ' = 1 AND p.id = ' + data.providerid
        ].join(" ");

        var statement2 = [
              'UPDATE hours h set mondayOpen = ' + wmysql.escape(mondayOpen) + ',mondayClose = ' + wmysql.escape(mondayClose) + ','
            , 'tuesdayOpen = ' + wmysql.escape(tuesdayOpen) + ',tuesdayClose = ' + wmysql.escape(tuesdayClose) + ', wednesdayOpen = ' + wmysql.escape(wednesdayOpen) + ',wednesdayClose = ' + wmysql.escape(wednesdayClose) + ','
            , 'thursdayOpen = ' + wmysql.escape(thursdayOpen) + ',thursdayClose = ' + wmysql.escape(thursdayClose) + ',fridayOpen = ' + wmysql.escape(fridayOpen) + ',fridayClose = ' + wmysql.escape(fridayClose) + ','
            , 'saturdayOpen = ' + wmysql.escape(saturdayOpen) + ',saturdayClose = ' + wmysql.escape(saturdayClose) + ',sundayOpen = ' + wmysql.escape(sundayOpen) + ',sundayClose = ' + wmysql.escape(sundayClose) + ' '
            , 'WHERE ' + data.groupid + ' = 1 AND h.providerid = ' + data.providerid
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
                  cordinatesModel.findOne({providerid: providerId}, function(err, p) {
                    if(!p) {
                      var gymLoc = new cordinatesModel({ providerid: providerId, loc: {lat: lat, lng: lng }});
                        gymLoc.save(function (err) {
                          if(err)
                            res.send(400,'{"status": "failed", "message": "geo cordinates update failed: ' + err + '"}');
                          else   
                            res.send( result );
                        });
                      } else { 
                        p.loc.lat = lat;
                        p.loc.lng = lng;  
                        p.save(function(err) {
                          if(err) 
                            res.send(400,'{"status": "failed", "message": "geo cordinates update failed: ' + err + '"}');
                          else
                            res.send( result );
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


  app.post('/api/provider/:providerId/employee/', function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
      check(req.params.providerId, errMsg.providerIdErr).isNumeric();
      check(req.body.username, errMsg.emailErr).isEmail();
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
              'INSERT INTO emplyees (providerid,token,username,password,first_name,last_name,groupid,lastlogin) '
            , 'SELECT id,"' + token + '",' + wmysql.escape(username) +  ',' + wmysql.escape(firstName) + ',' + wmysql.escape(lastName) + ',0,NOW() '
            , 'FROM providers p WHERE ' + data.groupid + ' = 1 AND p.id = ' + data.providerid
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "adding employee row failed"}');
          } else {
            res.send( result );
          }
        });
      }
    });
  });


  app.put('/api/provider/:providerId/employee/:employeemployeeId/updatePassword/', function(req, res) {
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
      check(req.params.providerId, errMsg.providerIdErr).isNumeric();
      check(req.params.employeeId, errMsg.employeeIdErr).isNumeric();
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
              'SELECT password FROM employees '
            , 'WHERE id = ' + data.id
        ].join(" ");

        var statement2 = [
              'UPDATE employees SET password = ' + wmysql.escape(req.body.npass) + ' '
            , 'WHERE id = ' + data.id
        ].join(" ");

        rmysql.query(statement, function(err, result, fields) {
          if(result.password == req.body.cpass) {
            wmysql.query(statement2, function(err, result, fields) {
              if(err || result.affectedRows < 1) {
                res.send(400,'{"status": "failed", "message": "update to employee table failed"}');
              } else {
                res.send( result );
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
      check(req.header('token'),errMsg.tokenErr).notNull();
      check(req.params.providerId, errMsg.providerIdErr).isNumeric();
      check(req.params.employeeId, errMsg.employeeIdErr).isNumeric();
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
              'DELETE FROM employees e'
            , 'WHERE e.id = ' + employeeId + ' AND ' + data.groupid + ' = 1 AND e.providerid = ' + data.providerid 
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "delete of employee row failed"}');
          } else {
            res.send( result );
          }
        });
      }
    });
  });


  app.get('/api/provider/:providerId/balance/', function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
      check(req.params.providerId, errMsg.providerIdErr).isNumeric();
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
            , 'FROM providerBilling pb '
            , 'WHERE pb.providerid = ' + data.providerid
        ].join(" ");

        rmysql.query(statement, function(err, result, fields) {
          if(err || !result) {
            res.send(400,'{"status": "failed", "message": "unable to retrieve balance"}');
          } else {
            res.send( result );
          }
        });
      }
    });
  });

  
  app.get('/api/provider/:providerId/disbursement/', function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
      check(req.params.providerId, errMsg.providerIdErr).isNumeric();
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
            , 'FROM disbursement d WHERE d.providerid = ' + data.providerid
        ].join(" ");

        rmysql.query(statement, function(err, result, fields) {
          if (err || !result) {
            res.send(400,'{"status": "failed", "message": "unable to retrieve disbursement"}');
          } else {
            res.send( result );
          }
        });
      }
    });
  });


  app.put('/api/provider/:providerId/disbursement/', function(req, res){
    try {
      check(req.header('token'),errMsg.tokenErr).notNull();
      check(req.params.providerId, errMsg.providerIdErr).isNumeric();
      check(req.body.paymentType, errMsg.paymentTypeErr).isNumeric()
      check(req.body.type, errMsg.typeErr).isNumeric()
      check(req.body.payLimit, errMsg.payLimitErr).isDecimal();
    } catch (e) {
      res.send('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    memcached.isMemAuth(req.header('token'), function(err,data) {
      if(err) {
        res.send(401,'{"status": "failed", "message": "invalid token"}');
      } else {   

        var paymentType = req.body.paymentType
        , payLimit = req.body.payLimit
        , type = req.body.type;

        var statement = [
              'UPDATE disbursement d '
            , 'SET d.paymenttype = ' + paymentType + ',d.paylimit = ' + payLimit + ',d.type = ' + type + ' '
            , 'WHERE ' + data.groupid + ' = 1 AND d.providerid = ' + data.providerid
        ].join(" ");

        wmysql.query(statement, function(err, result, fields) {
          if (err || result.affectedRows < 1) {
            res.send(400,'{"status": "failed", "message": "update to disbursement row failed"}');
          } else {
            res.send( result );
          }
        });
      }
    });
  });  
}