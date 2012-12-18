
/**
 * Module dependencies.
 */

var express = require('express')
  , crypto = require('crypto')
  , connect = require('connect')
  , fs = require("fs")
  , path = require("path")
  , routes = require('./routes')
  , http = require('http')
  , https = require('https')
  , _mysql = require('mysql')
  , moment = require('moment')
  , mongoose = require("mongoose")
  , geo = require('geo')
  , janrain = require('janrain-api')
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , winston = require('winston');

var WHOST = 'localhost';
var WPORT = 3306;
var WMYSQL_USER = 'zunefit';
var WMYSQL_PASS = 'zunefit';
var WDATABASE = 'zunefit';


var RHOST = 'localhost';
var RPORT = 3306;
var RMYSQL_USER = 'zunefit';
var RMYSQL_PASS = 'zunefit';
var RDATABASE = 'zunefit';

var wmysql = _mysql.createConnection({
    host: WHOST,
    port: WPORT,
    user: WMYSQL_USER,
    password: WMYSQL_PASS,
});


var rmysql = _mysql.createConnection({
    host: RHOST,
    port: RPORT,
    user: RMYSQL_USER,
    password: RMYSQL_PASS,
});


/*var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: 'debug.log', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: 'exceptions.log', json: false })
  ],
  exitOnError: false
});*/


try {
  wmysql.connect(function(err) {
    if(err) {
      throw new Error('Unable to Connect to SQL Master');
    } else {
      console.log("Connected to SQL Master");
    }
  });
} catch (e) {
  throw new Error('Unable to Connect to SQL Master');
}
try {
  rmysql.connect(function(err) {
    if(err) {
      throw new Error('Unable to Connect to SQL Slave');
    } else {
      console.log("Connected to SQL Slave");
    }
  });
} catch (e) {
      throw new Error('Unable to Connect to SQL Slave');	
}




wmysql.query('use ' + WDATABASE);
rmysql.query('use ' + RDATABASE);


//MongoDB Database
mongoose.connect('mongodb://zunefit:zunefit@flame.mongohq.com:27041/zuneGeo');

// Schema 
var Schema = mongoose.Schema;

var cordinates = new Schema({
  gymid : Number,
  loc : {lat: Number, lng: Number}
});

cordinates.index ({
  loc : "2d"
});

var cordinatesModel = mongoose.model('cordinates', cordinates);


var cloudfiles = require('cloudfiles');
var CFconfig = {
  auth: {
    username: 'tbossert',
    apiKey: '32f0b1d0ec09dce0214e2788234c8a67',
    host : 'identity.api.rackspacecloud.com'
  }
};


var CFcontainer = 'https://133ebe4227c90a13f1dc-8c7ec5384ed7d5bfa249897c03b2f07c.ssl.cf2.rackcdn.com/';
var CFclient = cloudfiles.createClient(CFconfig);

// API config settings
var engageAPI = janrain('8ebd390177383a0bd31e55ba97dfd27ec20c3eaf');
var salt = 'oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$';
var stripeKey = 'sk_test_fYUN8cMnv3xKCaTZjUG0Jxpv';

var stripe = require('stripe')(stripeKey);


 // ## CORS middleware
 var allowCrossDomain = function(req, res, next) {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token, ltype');
     res.header('Access-Control-Max-Age', '300');      
     // intercept OPTIONS method
     if ('OPTIONS' == req.method) {
       res.send(200);
     }
     else {
       next();
     }
 };


// SSL Certificate values
var options = {
  key: fs.readFileSync('ssl/api_zunefit.key'),
  ca: fs.readFileSync('ssl/api_zunefit_com.ca-bundle'),
  cert: fs.readFileSync('ssl/api_zunefit_com.crt'),
  requestCert: true,
}


// Build initial express Server
var app = module.exports = express();


// Set express server options
app.configure(function(){
  app.use(allowCrossDomain);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(connect.compress());
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});


//Environment specific settings
/*app.configure('development', function(){
  app.use(express.errorHandler());
});*/


// Begin routes
app.get('/', function(req, res){
  res.render('index', {
    title: 'ZuneFit',
  });
});		


app.get('/api/healthMe/', function(req, res){
  wmysql.query('SELECT id FROM transactions LIMIT 1', function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('"status": "failed"');
    } else {
      res.send('"status": "success');
    }
  });
});


app.get('/api/gymSearch/:type/:value/:state', function(req, res){
  if(req.params.type == 'zipcode') {
    var where = 'WHERE zipcode = ' + rmysql.escape(req.params.value) + ' AND state = ' + rmysql.escape(req.params.state);
  } else if(req.params.type == 'city') {
    var where = 'WHERE city = ' + rmysql.escape(req.params.value) + ' AND state = ' + rmysql.escape(req.params.state);
  } else if(req.params.type == 'name') {
    var where = 'WHERE name like ' + rmysql.escape('%' + req.params.value + '%');
  }
  rmysql.query('SELECT id,name,address,city,state,zipcode,email,phone FROM gyms ' + where, function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "no gyms found"}');
    } else {
      res.send(result);
    }
  });
});



app.post('/api/gymSearchAdvanced/', function(req, res){

  function getLoc(address,distance,callback) {
    var maxDistance = distance/69;
    var idArr = ""
    , j = 0
    geo.geocoder(geo.google, address, false,  function(fAddress,lat,lng) {
    console.log(lat);
    console.log(lng);
    console.log(fAddress);
     cordinatesModel.find({loc : { '$near': [lat, lng], '$maxDistance': maxDistance }} , function(err, result) {
      console.log(err);
      if (err) {
        res.send('{"status": "failed", "message":"No Gym matched location"}');
      } else {
        console.log(result);
        result.forEach(function(index, array) {
          if(j < 1) {
            console.log(index);
            idArr = idArr + index.gymid;
            j++;
          } else {
            idArr = idArr + ',' + index.gymid;
            }
          });
          callback(idArr);
         }
        });
      });
    }

  var i, len = 0
  , query = ''
  , where = '';

  query = query + ' INNER JOIN classes p ON g.id = p.gymid';
  if(req.body.workouts !== undefined) {
    var terms = req.body.workouts.split(',')
    len = terms.length;

    for (i = 0; i < len; i++){
      if(i == 0)
      {
        where = where + ' WHERE (p.service = "' + terms[i] + '"';
      } else {
        where = where + ' OR p.service = "' + terms[i] + '"';
      }
    }
    where = where + ')';
  }
  try {
    if(req.body.name !== undefined) {
      where = where + ' AND g.name like "%' + req.body.name + '%"';
    }
    if(req.body.rate !== undefined) {
      where = where + ' AND p.price < ' + req.body.rate;
    }
  } catch (e) {
  }
    function runQuery(query,where,callback){
      console.log(where);
      rmysql.query('SELECT DISTINCT g.id,g.name,g.address,g.city,g.state,g.zipcode,g.phone,g.email,g.image,g.facebook,g.twitter,g.googleplus,g.url FROM gyms g ' + query + where, function(err, result, fields) {
      console.log('SELECT DISTINCT g.id,g.name,g.address,g.city,g.state,g.zipcode,g.phone,g.email FROM gyms g ' + query + where);
      if (err) {
        res.send('{"status": "failed", "message": "No gym matched"}');
      } else {
        console.log(result);
        res.send(result);
       }
    });
  }

  if(typeof(req.body.address) !== 'undefined'){
    getLoc(req.body.address,req.body.maxDistance,function(idArr) {
      where = where + ' AND g.id IN (' + idArr + ')';
      runQuery(query,where,function() {});
     });
  } else {
    runQuery(query,where,function() {});
  }
});



app.post('/api/gymId/', function(req, res) {
        console.log("Lat: " + req.body.lat + " Lng: " + req.body.lng);
        var lat = req.body.lat;
        var lng = req.body.lng;

        cordinatesModel.find({loc : { $near: [lat, lng], $maxDistance: 0.00027448396957 }} , function(err, result) {
        if (err) {
          res.send('{"status": "failed", "message":"No Gym matched ID"}');
        } else {
                console.log(result);
                res.send(result);
        }
  });
});


app.get('/api/gymInfo/:gymId', function(req, res){
  try {
    check(req.params.gymId).notNull().isNumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id,name,address,city,state,zipcode,phone,email,contact,rate,image,facebook,twitter,googleplus,url FROM gyms WHERE id = ' + rmysql.escape(req.params.gymId), function(err, result, fields) {
    if (err || result.length < 1) {
      res.send('{"status": "failed", "message": "no gym matches"}');
    } else {
      res.send(result);
    }
  });
});



app.get('/api/featuredGyms/', function(req, res){
  rmysql.query('SELECT name,address,city,state,zipcode,phone,email FROM gyms WHERE featured = true', function(err, result, fields) {
    if (err || result.length < 1) {
     res.send('{"status": "failed", "message": "unable to retreive"}');
    } else {
      res.send(result);
    }
  });
});



app.get('/api/featuredWorkouts/', function(req, res){
  rmysql.query('SELECT gymid,service FROM classes WHERE featured = true', function(err, result, fields) {
    if (err || result.length < 1) {
     res.send('{"status": "failed", "message": "unable to retreive"}');
    } else {
      res.send(result);
    }
  });
});



app.get('/api/balance/', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT balance FROM users WHERE `' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
  if (err || result.length < 1) {
     res.send('{"status": "failed", "message": "no user found"}');
    } else {
      console.log(result);
      res.send(result);
    }
  });
});


app.post('/api/updatePayment/', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
    check(req.body.automatic).isNumeric;
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('UPDATE balance b INNER JOIN users u ON b.userid = u.id SET refillamount =  ' + wmysql.escape(req.body.refillamount) + ',minamount = ' + wmysql.escape(req.body.minamount) + ',automatic = ' + wmysql.escape(req.body.automatic) + ', cToken = "' + wmysql.escape(req.body.cToken) + '" WHERE u.' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err || result.length < 1) {
      res.send('{"status": "failed", "message":"unable to update"}');
    } else {
      res.send('{"status": "success", "message":"updated"}');
    }
  });
});


app.get('/api/disbursement/', function(req, res){
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT type,paylimit FROM disbursement d INNER JOIN gymUsers gu ON (d.gymid = gu.gymid) WHERE gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
    if (err || result.length < 1) {
      res.send('{"status": "failed", "message": "no gym matched"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/updateDisbursement/', function(req, res){
  try {
    check(req.header('token')).notNull();
    check(req.body.paylimit).notNull().isNumeric()
    check(req.body.type).notNull().isNumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('UPDATE disbursement d INNER JOIN gymUsers gu ON (d.gymid = gu.gymid) set d.type = ' + rmysql.escape(req.body.type) + ',d.paylimit = ' + rmysql.escape(req.body.paylimit) + ' WHERE gu.groupid = 1 AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
    if (err || result.length < 1) {
      res.send('{"status": "failed", "message": "unable to update"}');
    } else {
      res.send('{"status": "success"}');
    }
  });
});


app.get('/api/paymentMethods/', function(req, res){
  rmysql.query('SELECT id,type FROM paymentmethod', function(err, result, fields) {
    if (err || result.length < 1) {
      res.send('{"status": "failed", "message": "unable to retreive"}');
    } else {
      res.send(result);
    }
  });
});


app.get('/api/userPreferences/', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT CONVERT(AES_DECRYPT(u.email,"' + salt + '") USING utf8) AS email,u.first_name,u.last_name,CONVERT(AES_DECRYPT(u.address,"' + salt + '") USING utf8) AS address,CONVERT(AES_DECRYPT(u.address2,"' + salt + '") USING utf8) AS address2,u.city,u.state,u.zipcode,b.automatic,b.refillamount,b.minamount,b.cToken,CONVERT(AES_DECRYPT(u.phone,"' + salt + '") USING utf8) AS phone FROM users u INNER JOIN balance b ON u.id = b.userid WHERE u.`' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')), function(err, result, fields){
  if (err || result.length < 1) {
    res.send('{"status": "failed", "message": "unable to retreive"}');
  } else {
    res.send(result);
    }    
  });
});


app.post('/api/setPinCode/', function(req, res) {
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
    check(req.body.phone).len(10,10).isNumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  try {
    wmysql.query('UPDATE users SET phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '"), pincode = ' + wmysql.escape(req.body.pincode) + ' WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if (err || result.length < 1) {
        res.send('{"status": "failed", "message": "invalid token"}',401);
      } else {
        res.send('{"status": "success", "phone": "' + req.body.phone + '"}');
      }
    });
  } catch (e) {
    console.log(e);
    res.send('{"status": "failed", "message": "unable to update"}');
  } 
});


app.post('/api/userSchedule/', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
    check(req.body.start).regex(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    check(req.body.end).regex(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
    console.log(req.body.start);
    rmysql.query('SELECT s.id,g.name,s.classid,c.service,DATE_FORMAT(s.datetime, "%m/%d/%Y ") as date, DATE_FORMAT(s.datetime,"%l:%i %p") as time FROM schedule s INNER JOIN classes c ON (s.classid = c.id) INNER JOIN gyms g ON (s.gymid = g.id) INNER JOIN users u ON u.id = s.userid WHERE u.`' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')) + ' AND s.datetime > "' + req.body.start + '" AND s.datetime < "' + req.body.end + '" ORDER BY s.datetime', function(err, result, fields) {
    if (err || result.length < 1) {
      res.send('{"status": "failed", "message": "unable to update"}');
    } else {
      console.log(result);
      res.send(result);
    }
  });

});



app.post('/api/userCheckin/', function(req, res){
  try {
    check(req.body.phone).len(10,10).isNumeric()
    check(req.body.gymid).isNumeric()
    check(req.body.pincode).isAlphanumeric(); 
    check(req.body.datetime).regex(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i) 
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('call checkin(' + req.body.phone + ',"' + req.body.pincode + '",' + req.body.gymid + ',"' + req.body.datetime + '")', function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "checkin failed"}');
    } else {
      if(result[0][0].transMess != "success") {
        res.send('{"status": "failed", "message": "' + result[0][0].transMess + '"}');
      } else {
        res.send('{"status": "success"}');
      }
    }
  });    
});





app.post('/api/userSignup/', function(req, res){
  console.log(req);
  engageAPI.authInfo(req.header('token'), true, function(err, data) {
    if(err) {
      console.log('ERROR: ' + err.message);
      res.send('[{"status": "invalidToken"}]',401);
      return;
    } else {
      console.log(data);
      wmysql.query('SELECT id AS uid,email FROM users WHERE email = AES_ENCRYPT("' + data.profile.email + '","' + salt + '")', function(err, result, fields) {
        require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
          if(result.length < 1) {
            if(data.profile.providerName == 'Google') {
              var provider = 'google';
              var pid = data.profile.googleUserId;
            } else if(data.profile.providerName == 'Facebook') {
              var provider = 'facebook';
              var pid = '1111';
            } else {
              var provider = 'unknown';
              var id = 0;
            }
            wmysql.query('INSERT INTO users (email,first_name,last_name,`' + req.header('ltype') + '_token`,created,lastlogin) VALUES (AES_ENCRYPT("' + data.profile.email + '","' + salt + '"),"' + data.profile.name.givenName + '","' + data.profile.name.familyName + '","' + token + '",NOW(),NOW())', function(err, result, fields) {
              if (err || result.length < 1) {
                res.send('{"status": "failed", "message": "unable to add user"}');
              } else {
                wmysql.query('INSERT INTO balance (userid,automatic,refillamount,minamount) VALUES(' + result.insertId + ',false,0,0)', function(err, result, fields) {
                  if (err || result.length < 1) {
                    res.send('{"status": "failed", "message": "unable to add user"}');
                  } else {
                    res.send('[{"userid": "' + result.insertId + '", "token": "' + token + '"}]');
                  }
                });
              }
            });
          } else {
            var uid = result[0].uid;
            console.log(req.header('ltype'));
            wmysql.query('UPDATE users SET `' + req.header('ltype') + '_token` = "' + token + '", lastlogin = NOW() WHERE email = AES_ENCRYPT("' + data.profile.email + '","' + salt + '") AND status = 0', function(err, result, fields) {
              if (err || result.length < 1) {
                res.send('{"status": "failed", "message": "unable to update user"}');
              } else {
                res.send('[{"userid": "' + uid + '", "token": "' + token + '"}]');
              }
            });
          }
        });
      });
    }
  });
});


app.post('/api/userSignout/', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('UPDATE users SET token = null WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "unable to signout user"}');	
    }
    else {
        res.send('{"status": "success"}');
    }
  });
});


app.get('/api/getMessage/', function(req, res) {
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT m.id,m.message FROM messages m INNER JOIN users u ON m.id = u.last_message WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "no new messages"}');
    } else {
      wmysql.query('UPDATE users SET last_message = last_message + 1 WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "unable to update last message viewed"}');
        }
      });
      res.send(result);
    }
  });  
});


app.post('/api/gymLogin/', function(req, res){
  try {
    check(req.body.username).len(1,12).isAlphanumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT gu.gymid,g.name FROM gymUsers gu INNER JOIN gyms g ON gu.gymid = g.id WHERE gu.username = "' + req.body.username + '" AND gu.password = ' + rmysql.escape(req.body.password), function(err, result, fields) {
    if(result.length > 0){
      var gymid = result[0].gymid;
      var name = result[0].name;
      console.log(gymid);
      require('crypto').randomBytes(48, function(ex, buf) {
        var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
        wmysql.query('UPDATE gymUsers SET token = "' + token + '", lastlogin = NOW() WHERE username = "' + req.body.username + '"', function(err, result, fields){
	if(err || result.length < 1) {
	  res.send('[{"status": "failed", "message": "Unable to update"}]');
	} else {
	  res.send('[{"status": "success", "gymid": "' + gymid + '", "name": "' + name + '", "token": "' + token + '"}]');
   	   }
	});
      });
    } else {
      res.send('[{"status": "failed", "message": "no gym found"}]');
     }
   });
});


app.post('/api/updateUserPreferences/', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
    check(req.body.email).isEmail()
    check(req.body.zipcode).len(5,5).isNumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('UPDATE users SET first_name = ' + wmysql.escape(req.body.first_name) + ', last_name = ' + wmysql.escape(req.body.last_name) + ', address = AES_ENCRYPT("' + req.body.address + '","' + salt + '"), address2 = AES_ENCRYPT("' + req.body.address2 + '", "' + salt + '"), city = ' + wmysql.escape(req.body.city) + ', state = ' + wmysql.escape(req.body.state) + ', zipcode = "' + req.body.zipcode + '" WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) { 
      res.send('{"status": "failed", "message": "unable to update"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.post('/api/addEvent/', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
    check(req.body.classid).isNumeric()
    check(req.body.gymid).isNumeric()
    check(req.body.datetime).regex(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i) 
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT price FROM classes WHERE id = ' + req.body.classid, function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "no class found"}');
    } else {
      var price = result[0].price;
      rmysql.query('SELECT c.spots - COUNT(s.classid) AS openSpots FROM schedule s INNER JOIN classes c ON s.classid = c.id WHERE s.classid = ' + req.body.classid + ' AND s.datetime = "' + req.body.datetime + '"', function(err, result, fields) {
        console.log(result.length)
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "no class found"}');
        } else if (result[0].openSpots < 1) {
          res.send('{"status": "failed", "message": "class full"}');
        } else {
          rmysql.query('SELECT b.refillamount,b.cToken FROM users u INNER JOIN balance b ON u.id = b.userid WHERE b.minamount > u.balance - ' + price + ' AND b.automatic = true AND u.`' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
            if(result.length > 0)
            {
              stripe.charges.create({ amount: result[0].amount, currency: 'usd', customer: result[0].cToken }, function(err,charge) {
                if(err) {
                  res.send("refill not setup");
                } else {
                  wmysql.query('CALL refillBalance(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ')', function(err, result, fields) {
                    if(err || result.length < 1) {
                      res.send('{"status": "failed", "message": "unable to add event"}');
                    } else {
                      res.send('{' + result[0][0].transMess + '}');
                    }
                  });
                }
              });
            }
          });
          wmysql.query('CALL addEvent(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ',' + price + ',' + req.body.classid + ',' + req.body.gymid +',"' + req.body.datetime + '")', function(err, result, fields) {
            if(err || result.length < 1) {
              res.send('{"status": "failed", "message": "unable to add event"}');
            } else {
              res.send('{' + result[0][0].transMess + '}');
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
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('CALL deleteEvent(' + wmysql.escape(req.header('ltype')) + ',' + wmysql.escape(req.header('token')) + ',' + req.body.sid + ')', function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "unable to add event"}');
    } else {
      if(result[0][0].transMess != "success") {
        res.send('{"status": "failed", "message": "' + result[0][0].transMess + '"}');
      } else {
        res.send('{"status": "success"}')
      }
    }
  });
});



app.post('/api/getAllClasses/', function(req, res){
  try {
    check(req.body.offset).isNumeric();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id,gymid,service,price,spots,monday,tuesday,wednesday,thursday,friday,saturday,sunday FROM classes ORDER BY service DESC LIMIT 20 OFFSET ' + req.body.offset, function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "no matching gym"}');
    } else {
      res.send(result);
    }
  });
});


app.get('/api/getClasses/:gid', function(req, res){
  try {
    check(req.params.gid).isNumeric();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id,gymid,service,price,spots,monday,tuesday,wednesday,thursday,friday,saturday,sunday AS time FROM classes WHERE gymid = ' + req.params.gid, function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "no matching gym"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/classSize/', function(req, res){
  rmysql.query('SELECT c.spots - COUNT(s.classid) AS openSpots,c.spots AS maxSpots FROM schedule s INNER JOIN classes c ON s.classid = c.id WHERE s.classid = ' + req.body.classid + ' AND s.datetime = "' + req.body.datetime + '"', function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "no class matching id"}');
    } else {
      res.send(result);
    }
  });
});



app.post('/api/getDayClasses/', function(req, res){
  try {
    check(req.body.gymid).isNumeric();
    check(req.body.day).isAlphanumeric();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id,service,price,' + req.body.day + ' FROM classes WHERE gymid = ' + req.body.gymid + ' AND `' + req.body.day + '` IS NOT NULL AND `' + req.body.day + '` <> ""', function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "no matching gym"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/getClassParticipants/', function(req, res) {
  try {
    check(req.body.classid).isNumeric();
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT u.id,u.first_name,u.last_name FROM users u INNER JOIN schedule s ON u.id = s.userid INNER JOIN gymUsers gu ON s.gymid = gu.gymid WHERE s.classid = ' + req.body.classid + ' AND DATE(s.datetime) = "' + req.body.datetime + '" AND gu.token = ' + req.body.token, function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "no matching class"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/addClass/', function(req, res){
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('INSERT INTO classes (gymid,service,price,spots,monday,tuesday,wednesday,thursday,friday,saturday,sunday) SELECT gu.gymid,' + wmysql.escape(req.body.service) + ',' + req.body.price + ',' + req.body.spots + ',"' + req.body.monday + '","' + req.body.tuesday + '","' + req.body.wednesday + '","' + req.body.thursday + '","' + req.body.friday + '","' + req.body.saturday + '","' + req.body.sunday + '" FROM gyms g INNER JOIN gymUsers gu ON gu.gymid = g.id WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    var cid = result.insertId;
   if (err) {
      res.send('{"status": "failed", "message": "unable to add class"}');
    } else {
      res.send('{"stats": "success", "message": "' + cid + '"}');
    }
  });
});


app.get('/api/getClass/:cid', function(req, res){
  try {
    check(req.params.cid).isNumeric() 
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  console.log(req.params.cid);
  rmysql.query('SELECT id,gymid,service,price,spots,monday,tuesday,wednesday,thursday,friday,saturday,sunday FROM classes WHERE id = ' + req.params.cid, function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "no matching class"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/updateClass/', function(req, res){
  try {
    check(req.header('token')).notNull();
    check(req.body.price).len(1,5).isInt()
    check(req.body.classid).isNumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('UPDATE classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid SET service = ' + wmysql.escape(req.body.service) + ',price = "' + req.body.price + '",spots = ' + req.body.spots + ', monday = "' + req.body.monday + '", tuesday = "' + req.body.tuesday + '", wednesday = "' + req.body.wednesday + '", thursday = "' + req.body.thursday + '", friday = "' + req.body.friday + '", saturday = "' + req.body.saturday + '", sunday = "' + req.body.sunday + '" WHERE c.id = ' + req.body.classid + ' AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "unable to update class"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.del('/api/deleteClass/', function(req, res){  
  try {
    check(req.header('token')).notNull();
    check(req.body.classid).isNumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
   wmysql.query('DELETE c FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE c.id = ' + req.body.classid + ' AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "unable to delete class"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.post('/api/addGym/', function(req, res){
  try {
    check(req.body.username).len(1,12).isAlphanumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  require('crypto').randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    wmysql.query('INSERT INTO gyms (name) VALUES(' + wmysql.escape(req.body.name) +')', function(err, result, fields) {
     if (err) {
        res.send('{"status": "failed", "message": "unable to add gym"}');
      } else {
        var gymid = result.insertId;
        wmysql.query('INSERT INTO gymUsers (gymid,username,password,first_name,last_name,groupid,token) VALUES(' + gymid +',"' + req.body.username + '",' + wmysql.escape(req.body.password) + ',' + wmysql.escape(req.body.firstName) + ',' + wmysql.escape(req.body.lastName) + ',1,"' + token + '")', function(err, result, fields) {
          if (err) {
            res.send('{"status": "failed", "message": "unable to add gym user"}');
          } else {
            wmysql.query('INSERT INTO classes (gymid,service,price,datetime,status,daypass) VALUES(' + gymid + ',"Day Pass",0,NOW(),0,1)', function(err, result, fields) {
              if(err || result.length < 1) {
                res.send('{"status": "failed", "message": "unable to add day pass class"}');
              } else {
                wmysql.query('INSERT INTO disbursement (gymid,type,paylimit) SELECT id,"check",1000 FROM gyms WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
                  if (err || result.length < 1) {
                    res.send('{"status": "failed", "message": "unable to update disbursement"}');
                  } else {
                    res.send('{"status": "success"}');
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

//Add token validation
app.post('/api/addGymImage/', function(req, res){
  fs.writeFile('images/' + req.body.iName, new Buffer(req.body.image, "base64"), function(err) {
    CFclient.setAuth(function (err) {
      if(err) {
        res.send('{"status": "failed", "message": "unable to upload"}');
      } else {
        CFclient.addFile('gymImages', { remote: req.body.iName, local: 'images/' + req.body.iName }, function (err, uploaded) {
          if(err) {
            res.send('{"status": "failed", "message": "unable to upload"}');
          } else {
            wmysql.query('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid SET g.image = "' + CFcontainer + req.body.iName + '" WHERE gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
              if(err || result.length < 1) {
                res.send('{"status": "failed", "message": "unable to update"}'); 
              } else {
                res.send('{"status": "success", "path": "' + CFcontainer + req.body.iName + '"}');
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
    check(req.body.phone).len(10,10).isNumeric()
    check(req.body.email).isEmail()
    check(req.body.zipcode).len(5,5).isNumeric()
    check(req.body.limit).isNumeric() 
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid set g.address = ' + wmysql.escape(req.body.address) + ',g.city = ' + wmysql.escape(req.body.city) + ',g.state = ' + wmysql.escape(req.body.state) + ',g.zipcode = "' + req.body.zipcode + '",g.phone = "' + req.body.phone + '",g.email = "' + req.body.email + '",g.contact = "' + wmysql.escape(req.body.contact) + '",g.image = "' + wmysql.escape(req.body.image) + '",g.facebook = "' + wmysql.escape(req.body.facebook) + '",g.twitter = "' + wmysql.escape(req.body.twitter) + '",g.googleplus = "' + wmysql.escape(req.body.googleplus) + '",g.url = "' + wmysql.escape(req.body.url) + '",g.complete = true WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "unable to update gym"}');
    } else {
      wmysql.query('UPDATE hours h INNER JOIN gymUsers gu ON h.gymid = gu.gymid set monday = "' + req.body.monday + '",tuesday = "' + req.body.tuesday + '", wednesday = "' + req.body.wednesday + '",thursday = "' + req.body.thursday + '",friday = "' + req.body.friday + '",saturday = "' + req.body.saturday + '",sunday = "' + req.body.sunday + '" WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if (err) {
        res.send('{"status": "failed", "message": "unable to update hours"}');
      } else {
        wmysql.query('UPDATE disbursement d INNER JOIN gymUsers gu set d.type = ' + wmysql.escape(req.body.type) + ',d.paylimit = ' + req.body.limit + ' WHERE gu.groupid = 1 AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
            if (err) {
              res.send('{"status": "failed", "message": "unable to update disbursement"}');
            } else {
              geo.geocoder(geo.google, req.body.address + ',' + req.body.city + ',' + req.body.state, false,  function(fAddress,lat,lng) {
               cordinatesModel.findOne({gymid: req.body.gid}, function(err, p) {
                 if(!p) {
                   var gymLoc = new cordinatesModel({ gymid: req.body.gid, loc: {lat: lat, lng: lng }});
                     gymLoc.save(function (err) {
                       if(err)
                         res.send('{"status": "failed", "message": "Unable to add geo cordinates"}');
                       else   
                         res.send('{"status": "success"}');
                    });
                  } else { 
                   p.loc.lat = lat;
                   p.loc.lng = lng;  
                   p.save(function(err) {
                     if(err) 
                       res.send('{"status": "failed", "message": "Unable to update geo cordinates"}');
                     else
                       res.send('{"status": "success"}');
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


app.post('/api/addGymUser/', function(req, res){
  try {
    check(req.header('token')).notNull();
    check(req.body.username).len(1,12).isAlphanumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  require('crypto').randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
  });
  wmysql.query('INSERT INTO gymUsers (gymid,token,username,password,first_name,last_name,groupid,lastlogin) SELECT id,"' + token + '","' + req.body.username +  '",' + wmysql.escape(req.body.firstName) + ',' + wmysql.escape(req.body.lastName) + ',0,NOW() FROM gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid WHERE gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "unable to add gym user"}');
    } else {
      res.send('{"status": "success"}');
    }
  });
});


app.post('/api/updateGymEmployee/', function(req, res) {
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT password FROM gymUsers WHERE token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.password == req.body.cpass) {
      wmysql.query('UPDATE gymUsers set password = "' + req.body.npass + '" WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "unable to update gym user"}');
        } else {
          res.send('{"status": "success"}');
        }
      });
    } else {
      res.send('{"status": "failed", "message":"Incorrect current password"}');
    }
  });
});


app.post('/api/deleteGymUser/', function(req, res){
  rmysql.query('SELECT id FROM gymUsers WHERE groupid = 1 AND token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.length > 0) {
      wmysql.query('DELETE FROM gymUsers WHERE id = ' + req.body.eid, function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "unable to delete gym user"}');
        } else {
          res.send('{"status": "success"}');
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
  }
  rmysql.query('SELECT balance FROM gymBilling gb INNER JOIN gymUsers gu ON gb.gid = gu.gymid WHERE gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "unable to retreive"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/gymSchedule/', function(req, res){
  try {
    check(req.header('token')).notNull();
    check(req.body.start).regex(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    check(req.body.end).regex(/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
    console.log()
    rmysql.query('SELECT u.id AS uid,s.id AS sid,c.id as cid,u.first_name,u.last_name,c.service,DATE_FORMAT(s.datetime, "%M %D %Y ") AS date,TIME(s.datetime) AS time FROM schedule s INNER JOIN users u ON s.userid = u.id INNER JOIN classes c ON s.classid = c.id INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = ' + rmysql.escape(req.header('token')) + ' AND s.datetime > "' + req.body.start + '" AND s.datetime < "' + req.body.end + '" ORDER BY s.datetime', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "unable to retreive"}');
    } else {
      res.send(result);
    }
  });
});


app.get('/api/getTags/:gid', function(req, res){
  rmysql.query('SELECT id,tag FROM gymTags WHERE gymid = ' + req.params.gid, function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"unable to retrieve tags"}');
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
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
    if(err || result.length < 1) { 
      res.send('{"status": "failed", "message":"invalid token"}',401);
    } else {
      wmysql.query('INSERT INTO gymTags (gymid,tag) VALUES (' + req.body.gymid + ',' + wmysql.escape(req.body.tag) + ')', function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message":"unable to add tag"}');
        } else {
          res.send('{"status": "success", "tid": "' + result.insertId + '"}');
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
  }
  rmysql.query('SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
    if(err || result.length < 1) { 
      res.send('{"status": "failed", "message":"invalid token"}',401);
    } else {
      wmysql.query('DELETE FROM gymTags WHERE id = ' + req.body.tid, function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message":"unable to delete tag"}');
        } else {
          res.send('{"status": "success"');
        }
      });
    }
  });
});


app.del('/api/deleteAccount/', function(req, res){ 
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('UPDATE users SET status = 1 WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) {
     res.send('{"status": "failed", "message": "unable to delete events"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.post('/api/gymView', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
    check(req.body.gymid).isNumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('INSERT INTO stats (gymid,userid,type) SELECT ' + req.body.gymid + ',id,0 FROM users WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "unable to add gymview"}');
    } else { 
      res.send('{"stats": "success"}');
      }
   });
});


app.post('/api/gymVisit', function(req, res){
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
    check(req.body.gymid).isNumeric()
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('INSERT INTO stats (gymid,userid,type) SELECT ' + req.body.gymid + ',id,1 FROM users WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "unable to add gymvisit"}');
    } else { 
      res.send('{"stats": "success"}');
      }
   });
});


app.get('/api/gymStats/', function(req, res){
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT(SELECT COUNT(*) FROM stats s INNER JOIN gymUsers gu ON s.gymid = gu.gymid WHERE s.type = 1 AND gu.token = ' + rmysql.escape(req.header('token')) + ') AS visits,(SELECT COUNT(*) FROM stats s INNER JOIN gymUsers gu ON s.gymid = gu.gymid WHERE s.type = 0 AND gu.token = ' + rmysql.escape(req.header('token')) + ') AS views,(SELECT AVG(price) FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = ' + rmysql.escape(req.header('token')) + ') AS price', function(err, result, fields) {
  if (err) {
    res.send('{"status": "failed", "message": "unable to retreive"}');
  } else {
    res.send(result);
    }
  });
});


app.post('/api/paymentTransaction/', function(req, res) {
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id AS uid FROM users WHERE `' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "no user matched"}');
    } else {
      var uid = result[0].uid;
      stripe.charges.retrieve(req.body.refid, function(err,charge) {
        console.log(charge);
        if(err) {
          console.log("Couldn't retrieve charge");
        } else {
          wmysql.query('INSERT INTO transactions (userid,refid,timestamp) VALUES (' + uid + ',"' + wmysql.escape(req.body.refid) + '",NOW())', function(err, result, fields) {
            if (err) {
              res.send('{"status": "failed", "message": "unable to add transaction"}');
            } else {
              wmysql.query('UPDATE users SET balance = balance + ' + charge.amount/100 + ' WHERE id = ' + uid, function(err, result, fields) {
                if(err || result.length < 1) {
                  res.send('{"status": "failed", "message": "unable to update balance"}');
                } else {
                  res.send('{"stats": "success"}');
                }
              });  
            }
          });
        }
      });
    }
  });
});


app.post('/api/getTransactions/', function(req, res) {
  try {
    check(req.header('ltype')).isAlphanumeric();
    check(req.header('token')).notNull();
    check(req.body.offset).isNumeric();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT refid FROM transactions t INNER JOIN users u WHERE u.`' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')) + ' ORDER BY timestamp DESC LIMIT 5 OFFSET ' + req.body.offset, function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "unable to retreive"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/newReward/', function(req, res) {
  try {
    check(req.body.uid).isNumeric();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  if(req.body.network == 'facebook' || req.body.network == 'twitter') {
    rmysql.query('INSERT INTO rewards (userid,network,timestamp) VALUES(' + req.body.uid + ',"' + req.body.network + '",NOW())', function(err, result, fields) {
      if(err || result.length < 1) {
        res.send('{"status": "failed", "message":"Already Applied"}');
      } else {
        res.send('{"status": "success"}');
      }
    });
  } else {
    res.send('{"status": "failed", "message":"Not a valid network"}')
  }
});


//ADMIN Section of calls

app.post('/api/aLogin/', function(req, res) {
   rmysql.query('SELECT au.userid FROM users u INNER JOIN adminUsers au ON u.id = au.userid WHERE u.email = AES_ENCRYPT("' + req.body.username + '","' + salt + '") AND au.password = ' + rmysql.escape(req.body.password), function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message":"Invalid username/password"}',401);
    } else {
      require('crypto').randomBytes(48, function(ex, buf) {
        var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
        var userid = result[0].userid;
        wmysql.query('UPDATE adminUsers set token = "' + token + '" WHERE userid = ' + userid, function(err, result, fields) {
          if(err || result.length < 1) {
            res.send('{"status": "failed", "message": "unable to update"}');
          } else {
            res.send('{"status": "success", "token": "' + token + '"}');
          }
        });
      });    
    }
  });
});


app.post('/api/aLogout/', function(req, res){
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('UPDATE adminUsers SET token = null WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(err || result.length < 1) {
      res.send('{"status": "failed", "message": "unable to logout"}');  
    }
    else {
      res.send('{"status": "success"}');
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
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.length > 0) {
      rmysql.query('SELECT g.id,g.name,g.address,g.city,g.state,g.zipcode,g.email,g.phone,g.contact,gb.balance,p.type,d.paylimit FROM gyms g INNER JOIN gymBilling gb ON g.id = gb.gid INNER JOIN disbursement d ON g.id = d.gymid INNER JOIN paymentmethod p ON p.id = d.type ORDER BY g.id DESC LIMIT 20 OFFSET ' + req.body.offset, function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "unable to retreive"}');  
        }
        else {
          res.send(result);
        }
      });
    } else {
      res.send('{"status": "failed", "message":"invalid token"}',401);
    }
  });
});


app.get('/api/getEmployees/:gid', function(req, res){
  console.log(req.header('token'));
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.length > 0) {
      rmysql.query('SELECT gymid,username,first_name,last_name,groupid,lastlogin FROM gymUsers WHERE gymid = ' + req.params.gid, function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "unable to retreive"}');  
        }
        else {
          res.send(result);
        }
      });
    } else {
      res.send('{"status": "failed", "message":"invalid token"}',401);
    }
  });
});


app.post('/api/updateEmployee/:guid', function(req, res){
  console.log(req.header('token'));
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.length > 0) {
      rmysql.query('UPDATE gymUsers set first_name = ' + req.body.first_name + ',last_name = ' + req.body.last_name + ',groupid = ' + req.body.groupid + ',password = ' + req.body.password + ' WHERE id = ' + req.params.guid, function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "unable to update"}');  
        }
        else {
          res.send(result);
        }
      });
    } else {
      res.send('{"status": "failed", "message":"invalid token"}',401);
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
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.length > 0) {
      rmysql.query('SELECT id,CONVERT(AES_DECRYPT(email,"' + salt + '") USING utf8) AS email,first_name,last_name FROM users ORDER BY email DESC LIMIT 20 OFFSET ' + req.body.offset, function(err, result, fields) {
        if(err || result.length < 1) {
          res.send('{"status": "failed", "message": "unable to retreive"}');  
        }
        else {
          res.send(result);
        }
      });
    } else {
      res.send('{"status": "failed", "message":"invalid token"}',401);
    }
  });
});



app.get('/api/getUser/:uid', function(req, res){
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.length > 0) {
      rmysql.query('SELECT id,CONVERT(AES_DECRYPT(u.email,"' + salt + '") USING utf8) AS email,u.first_name,u.last_name,CONVERT(AES_DECRYPT(u.address,"' + salt + '") USING utf8) AS address,u.city,u.state,u.zipcode,b.amount,b.automatic,b.refillamount,b.minamount,b.cToken FROM users u INNER JOIN balance b ON u.id = b.userid WHERE u.id = ' + rmysql.escape(req.params.uid) , function(err, result, fields){
        if (err) {
          res.send('{"status": "failed", "message": "unable to retreive"}');
        } else {
          res.send(result);
        }       
      });
    } else {
      res.send('{"status": "failed", "message":"invalid token"}',401);
    }  
  });
});


app.get('/api/getAdmins/', function(req, res){
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.length > 0) {
      rmysql.query('SELECT au.id,CONVERT(AES_DECRYPT(u.email,"oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$") USING utf8) AS email,u.first_name,u.last_name,CONVERT(AES_DECRYPT(u.address,"oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$") USING utf8) AS address,u.city,u.state,u.zipcode FROM adminUsers au INNER JOIN users u ON au.userid = u.id', function(err, result, fields){
        if (err) {
          res.send('{"status": "failed", "message": "unable to retreive"}');
        } else {
          res.send(result);
        }    
      });
    } else {
      res.send('{"status": "failed", "message":"invalid token"}',401);
    }
  });    
});


app.post('/api/makeAdmin/', function(req, res){
  console.log(req.header('token'));
  try {
    check(req.header('token')).notNull();
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id FROM adminUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(result.length > 0) {
      rmysql.query('SELECT id FROM users WHERE id = ' + rmysql.escape(req.body.userid), function(err, result, fields) {
        if(result.length > 0) {
          wmysql.query('INSERT INTO adminUsers (userid,password) VALUES(' + wmysql.escape(req.body.userid) + ',"' + req.body.password + '")', function(err, result, fields) {
            if(err || result.length < 1) {
              res.send('{"status": "failed", "message": "unable to insert"}');  
            } else {
              res.send(result);
            }
          });
        } else {
          res.send('{"status": "failed", "message":"user account does exist"}');
        }
      });
    } else {
      res.send('{"status": "failed", "message":"invalid token"}',401);
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
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  wmysql.query('CALL processBilling(' + wmysql.escape(req.header('token')) + ',' + req.body.gid + ',' + req.body.action + ',' + wmysql.escape(req.body.amount) + ')', function(err, result, fields) {
    if(result[0][0].transMess != "success") {
      res.send('{"status": "failed", "message": "' + result[0][0].transMess + '"}');
    } else {
      res.send('{"status": "success"}')
    }
  });
});


// Catch uncaught exception to prevent app from dying
/*process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});*/

var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {
  // Set Server to listen on specified ports
  http.createServer(app).listen(80);
  console.log("started server on 80");

  https.createServer(options, app).listen(443);
  console.log("started server on 443");
}
