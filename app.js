
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
  , sanitize = require('validator').sanitize;

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

var wmysql = _mysql.createClient({
    host: WHOST,
    port: WPORT,
    user: WMYSQL_USER,
    password: WMYSQL_PASS,
});


var rmysql = _mysql.createClient({
    host: RHOST,
    port: RPORT,
    user: RMYSQL_USER,
    password: RMYSQL_PASS,
});

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


// API config settings
var engageAPI = janrain('8ebd390177383a0bd31e55ba97dfd27ec20c3eaf');
var salt = 'oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$';
var stripeKey = 'sk_test_fYUN8cMnv3xKCaTZjUG0Jxpv';

var stripe = require('stripe')(stripeKey);


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
var app = module.exports = express.createServer();


// Set express server options
app.configure(function(){
  app.use(allowCrossDomain);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(connect.compress());
  app.use(express.logger('dev'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.errorHandler());
  app.use(app.router);
});


//Environment specific settings
/*app.configure('development', function(){
  app.use(express.errorHandler());
});
*/

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
  rmysql.query('SELECT id,name,address,city,state,zipcode,phone,email,contact,rate,image,facebook,twitter,googleplus,url FROM gyms WHERE id = "' + req.params.gymId + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "No Gym matched ID"}');
    } else {
      res.send(result);
    }
  });
});




app.get('/api/featuredGyms/', function(req, res){
  rmysql.query('SELECT name,address,city,state,zipcode,phone,email FROM gyms WHERE featured = true', function(err, result, fields) {
    if (err) {
     res.send('{"status": "failed", "message":"Unable to retreive"}');
    } else {
      res.send(result);
    }
  });
});



app.get('/api/featuredWorkouts/', function(req, res){
  rmysql.query('SELECT gymid,service FROM classes WHERE featured = true', function(err, result, fields) {
    if (err) {
     res.send('{"status": "failed", "message":"Unable to retreive"}');
    } else {
      res.send(result);
    }
  });
});



app.get('/api/balance/', function(req, res){
  rmysql.query('SELECT balance FROM users WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
  if (err) {
     res.send('{"status": "failed", "message":"failed to get Balance"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/updatePayment/', function(req, res){
    wmysql.query('UPDATE balance b INNER JOIN users u ON b.userid = u.id SET refillamount =  "' + req.body.refillamount + '",automatic = "' + req.body.automatic + '", schedule = "' + req.body.schedule + '" WHERE u.' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"unable to update"}');
    } else {
      res.send('{"status": "success", "message":"updated"}');
    }
  });
});


app.get('/api/disbursement/', function(req, res){
  rmysql.query('SELECT type,paylimit FROM disbursement d INNER JOIN gymUsers gu ON (d.gymid = gu.gymid) WHERE gu.token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "Unable to get methods"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/updateDisbursement/', function(req, res){
  wmysql.query('UPDATE disbursement d INNER JOIN gymUsers gu ON (d.gymid = gu.gymid) set d.type = ' + req.body.type + ',d.paylimit = ' + req.body.paylimit + ' WHERE gu.token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "Update failed"}');
    } else {
      res.send('{"status": "success"}');
    }
  });
});


app.get('/api/paymentMethods/', function(req, res){
  rmysql.query('SELECT id,type FROM paymentmethod', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "No Payment methods"}');
    } else {
      res.send(result);
    }
  });
});


app.get('/api/userPreferences/', function(req, res){
  rmysql.query('SELECT AES_DECRYPT(u.email,"' + salt + '") AS email,u.first_name,u.last_name,AES_DECRYPT(u.address,"' + salt + '") AS address,AES_DECRYPT(u.address2,"' + salt + '") AS address2,u.city,u.state,u.zipcode, b.amount,b.automatic,b.refillamount,b.schedule,CONVERT(AES_DECRYPT(u.phone,"' + salt + '") USING utf8) AS phone FROM users u INNER JOIN balance b ON u.id = b.userid WHERE u.' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields){
  if (err) {
    res.send('{"status": "failed", "message": "Unable to Retrieve"}');
  } else {
    res.send(result);
    }    
  });
});


app.post('/api/setPinCode/', function(req, res) {
  wmysql.query('UPDATE users SET phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '"),pincode = "' + req.body.pincode + '" WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "Unable to update"}');
    } else {
      res.send('{"status": "success", "phone": "' + req.body.phone + '"}');
    }
  }); 
});


app.post('/api/userSchedule/', function(req, res){
    console.log(req.body.start);
    rmysql.query('SELECT s.id,g.name,s.classid,c.service,DATE_FORMAT(s.datetime, "%m/%d/%Y ") as date, DATE_FORMAT(s.datetime,"%l:%i %p") as time FROM schedule s INNER JOIN classes c ON (s.classid = c.id) INNER JOIN gyms g ON (s.gymid = g.id) INNER JOIN users u ON u.id = s.userid WHERE u.' + req.header('ltype') + '_token = "' + req.header('token') + '" AND s.datetime > "' + req.body.start + '" AND s.datetime < "' + req.body.end + '" ORDER BY s.datetime', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"Unable to retreive"}');
    } else {
      console.log(result);
      res.send(result);
    }
  });

});



app.post('/api/userCheckin/', function(req, res){
console.log("checkin");
  try {
    check(req.body.phone).notEmpty().len(10,10).isNumeric()
    check(req.body.gymid).notEmpty().isNumeric()
    check(req.body.pincode).notEmpty().isAlphanumeric(); 
  } catch (e) {
    res.send('{"status": "failed", "message":"' + e.message + '"}');
  }
  rmysql.query('SELECT id FROM users WHERE phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND pincode = ' + rmysql.escape(req.body.pincode), function(err, result, fields) {
    if(result.length < 1) {
      res.send('[{"status": "failed","message": "Invalid phone/pincode"}]',401);
    } else {
      var uid = result[0].id;
      console.log('SELECT "success" AS status,u.id AS uid,u.first_name,u.last_name,u.balance,s.id AS sid,g.name,s.classid,c.service,DATE_FORMAT(s.datetime, "%M %D %Y ") as date, DATE_FORMAT(s.datetime,"%l:%i %p") as time FROM schedule s INNER JOIN classes c ON s.classid = c.id INNER JOIN gyms g ON s.gymid = g.id INNER JOIN users u ON u.id = s.userid WHERE u.phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND u.pincode = "' + req.body.pincode + '" AND s.datetime >= NOW() AND s.datetime <= NOW() + INTERVAL 1 HOUR AND c.daypass = 0 ORDER BY s.datetime LIMIT 1')
      rmysql.query('SELECT "success" AS status,u.id AS uid,u.first_name,u.last_name,u.balance,s.id AS sid,g.name,s.classid,c.service,DATE_FORMAT(s.datetime, "%M %D %Y ") as date, DATE_FORMAT(s.datetime,"%l:%i %p") as time FROM schedule s INNER JOIN classes c ON s.classid = c.id INNER JOIN gyms g ON s.gymid = g.id INNER JOIN users u ON u.id = s.userid WHERE u.phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND u.pincode = "' + req.body.pincode + '" AND s.datetime >= NOW() AND s.datetime <= NOW() + INTERVAL 30 MINUTE AND c.daypass = 0 ORDER BY s.datetime LIMIT 1', function(err, sResult, fields) {
          console.log(err);
          if(sResult.length < 1) {
            console.log('SELECT "success" AS status,u.id AS uid,u.first_name,u.last_name,u.balance,s.id AS sid,g.name,s.classid,c.service,DATE_FORMAT(s.datetime, "%M %D %Y ") as date, DATE_FORMAT(s.datetime,"%l:%i %p") as time FROM schedule s INNER JOIN classes c ON s.classid = c.id INNER JOIN gyms g ON s.gymid = g.id INNER JOIN users u ON u.id = s.userid WHERE u.phone = AES_ENCRYPT("' + req.body.phone + '","oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$") AND u.pincode = "' + req.body.pincode + '" AND DATE(s.datetime) = DATE("' + req.body.date + '") AND c.daypass = 1 ORDER BY s.datetime LIMIT 1')
            rmysql.query('SELECT "success" AS status,u.id AS uid,u.first_name,u.last_name,u.balance,s.id AS sid,g.name,s.classid,c.service,DATE_FORMAT(s.datetime, "%M %D %Y ") as date, DATE_FORMAT(s.datetime,"%l:%i %p") as time FROM schedule s INNER JOIN classes c ON s.classid = c.id INNER JOIN gyms g ON s.gymid = g.id INNER JOIN users u ON u.id = s.userid WHERE u.phone = AES_ENCRYPT("' + req.body.phone + '","oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$") AND u.pincode = "' + req.body.pincode + '" AND DATE(s.datetime) = DATE("' + req.body.date + '")  AND c.daypass = 1 ORDER BY s.datetime LIMIT 1', function(err, sResult, fields) {
                if(sResult.length < 1) {
                  res.send('[{"status": "failed","message": "no scheduled workouts"}]');
                } else {
                  var sid = sResult[0].sid;
                  console.log('SELECT id FROM checkin WHERE userid = ' + uid + ' AND scheduleid = ' + sid)
                  rmysql.query('SELECT id FROM checkin WHERE userid = ' + uid + ' AND scheduleid = ' + sid, function(err, result, fields) {
                    if(result.length > 0) {
                      res.send('[{"status": "failed","message": "already checked in"}]');
                    } else {
                      wmysql.query('UPDATE users u INNER JOIN schedule s ON u.id = s.userid SET u.balance = u.balance - s.price WHERE u.phone = AES_ENCRYPT("' + req.body.phone + '","oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$") AND u.pincode = "' + req.body.pincode + '" AND s.id = ' + sid + ' AND u.balance - s.price >= 0', function(err, wResult, fields) {
                        console.log(err)
                        if(wResult.affectedRows < 1) {
                          res.send('[{"status": "failed","message": "insufficient balance"}]');
                        } else {
                          wmysql.query('UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.balance + round(s.price * g.commission/100,2), gb.balance = gb.balance + round(s.price - s.price * g.commission/100,2) WHERE gb.gid = ' + req.body.gymid + ' AND s.id = ' + sid, function(err, result, fields) {
                            console.log(err)
                            if(err) {
                              res.send('[{"status": "failed","message": "checked in failed"}]');
                            } else {
                              wmysql.query('INSERT INTO checkin (userid,gymid,datetime,scheduleid) SELECT id,"' + req.body.gymid + '",NOW(),' + sid + ' FROM users WHERE phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND pincode = "' + req.body.pincode + '"', function(err, wresult, fields) {
                                if(err) {
                                  res.send('[{"status": "failed","message": "checked in failed"}]');
                                } else {
                                  res.send(sResult);
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
          } else {
            var sid = sResult[0].sid;
            console.log('SELECT id FROM checkin WHERE userid = ' + uid + ' AND scheduleid = ' + sid)
            rmysql.query('SELECT id FROM checkin WHERE userid = ' + uid + ' AND scheduleid = ' + sid, function(err, result, fields) {
              if(result.length > 0) {
                res.send('[{"status": "failed","message": "already checked in"}]');
              } else {
                wmysql.query('UPDATE users u INNER JOIN schedule s ON u.id = s.userid SET u.balance = u.balance - s.price WHERE u.phone = AES_ENCRYPT("' + req.body.phone + '","oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$") AND u.pincode = "' + req.body.pincode + '" AND s.id = ' + sid + ' AND u.balance - s.price >= 0', function(err, wResult, fields) {
                  if(wResult.affectedRows < 1) {
                    res.send('[{"status": "failed","message": "insufficient balance"}]');
                  } else {
                    console.log('UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.balance + round(s.price * g.commission/100,2), gb.balance = gb.balance + round(s.price - s.price * g.commission/100,2) WHERE gb.gid = ' + req.body.gymid + ' AND s.id = ' + sid)
                    wmysql.query('UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.balance + round(s.price * g.commission/100,2), gb.balance = gb.balance + round(s.price - s.price * g.commission/100,2) WHERE gb.gid = ' + req.body.gymid + ' AND s.id = ' + sid, function(err, result, fields) {
                      if(err) {
                        res.send('[{"status": "failed","message": "checked in failed"}]');
                      } else {
                        console.log('INSERT INTO checkin (userid,gymid,datetime,scheduleid) SELECT id,"' + req.body.gymid + '",NOW(),' + sid + ' FROM users WHERE phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND pincode = "' + req.body.pincode + '"')
                        wmysql.query('INSERT INTO checkin (userid,gymid,datetime,scheduleid) SELECT id,"' + req.body.gymid + '",NOW(),' + sid + ' FROM users WHERE phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND pincode = "' + req.body.pincode + '"', function(err, wresult, fields) {
                          if(err) {
                            res.send('[{"status": "failed","message": "checked in failed"}]');
                          } else {
                            res.send(sResult);
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
    }
  });
});


app.post('/api/userSignup/', function(req, res){
 console.log(req.header('token'));
 console.log(req);
  engageAPI.authInfo(req.header('token'), true, function(err, data) {
      if(err) {
        console.log('ERROR: ' + err.message);
        res.send('[{"status": "invalidToken"}]');
        return;
      }
      else {
	console.log(data);
        wmysql.query('SELECT id,email FROM users WHERE email = AES_ENCRYPT("' + data.profile.email + '","' + salt + '")', function(err, result, fields) {
	console.log(result);
          require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
	  try {
          	var uid = result[0].id;
	  } catch (e) {
	  }
            if(result.length < 1) {
              wmysql.query('INSERT INTO users (email,first_name,last_name,' + req.header('ltype') + '_token,created,lastlogin) VALUES (AES_ENCRYPT("' + data.profile.email + '","' + salt + '"),"' + data.profile.name.givenName + '","' + data.profile.name.familyName + '","' + token + '",NOW(),NOW())', function(err, result, fields) {
              if (err) {
                res.send('{"status": "failed", "message": "signup failed to create"}');
              } else {
	        wmysql.query('INSERT INTO balance (userid,amount,automatic,refillamount) VALUES(' + result.insertId + ',0,false,0)', function(err, result, fields) {
	          if (err) {
                res.send('{"status": "failed", "message": "Unable to add balance"}');
              } else {
                res.send('[{"userid": "' + uid + '", "token": "' + token + '"}]');
	            }
	          });
          }
        });
      } else {
	  console.log(token);
	  console.log(req.header('ltype'));
          wmysql.query('UPDATE users SET ' + req.header('ltype') + '_token = "' + token + '", lastlogin = NOW() WHERE email = AES_ENCRYPT("' + data.profile.email + '","' + salt + '")', function(err, result, fields) {
            if (err) {
              res.send('{"status": "failed", "message":"unable to update users token"}');
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
  wmysql.query('UPDATE users SET token = null WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if(err) {
      res.send('{"status": "failed", "message": "Signout failed"}');	
    }
    else {
        res.send('{"status": "success"}');
    }
  });
});


app.post('/api/gymLogin/', function(req, res){
  rmysql.query('SELECT gu.gymid,g.name FROM gymUsers gu INNER JOIN gyms g ON gu.gymid = g.id WHERE gu.username = "' + req.body.username + '" AND gu.password = "' + req.body.password + '"', function(err, result, fields) {
    if(result.length > 0){
      var gymid = result[0].gymid;
      var name = result[0].name;
      console.log(gymid);
      require('crypto').randomBytes(48, function(ex, buf) {
        var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
        wmysql.query('UPDATE gymUsers SET token = "' + token + '", lastlogin = NOW() WHERE username = "' + req.body.username + '"', function(err, result, fields){
	if(err) {
	  console.log(err);
	  res.send('[{"status": "failed", "message": "Unable to login"}]');
	} else {
	  res.send('[{"status": "success", "gymid": "' + gymid + '", "name": "' + name + '", "token": "' + token + '"}]');
   	   }
	});
      });
    } else {
      res.send('[{"status": "failed", "message":"failed"}]');
     }
   });
});


app.post('/api/updateUserPreferences/', function(req, res){
  wmysql.query('UPDATE users SET email = AES_ENCRYPT("' + req.body.email + '","' + salt + '"), first_name = "' + req.body.first_name + '", last_name = "' + req.body.last_name + '", address = AES_ENCRYPT("' + req.body.address + '","' + salt + '"), address2 = AES_ENCRYPT("' + req.body.address2 + '","' + salt + '"), city = "' + req.body.city + '", state = "' + req.body.state + '", zipcode = "' + req.body.zipcode + '" WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) { 
      res.send('{"status": "failed", "message": "Unable to update"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.post('/api/addEvent/', function(req, res){
  wmysql.query('INSERT INTO schedule (userid,gymid,classid,price,datetime) SELECT id,' + req.body.gymid + ',' + req.body.classid + ',' + req.body.price + ',' + req.body.datetime + ' FROM users WHERE `' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "unable to add event"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.del('/api/deleteEvent/', function(req, res){  
  wmysql.query('DELETE s FROM schedule s INNER JOIN users u ON s.userid = u.id WHERE s.id = ' + req.body.sid + ' AND u.' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "Unable to delete event"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});

// Need to review what this call will be used for
/*
app.post('/api/redeemed/', function(req, res){
  wmysql.query('UPDATE schedule SET redeemed = true WHERE id = ' + req.body.sid + ' AND gymid IN (SELECT gymid FROM gymUsers WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '")', function(err, result, fields) {
  if (err) {
    res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
  } else {
    res.send('{"stats": "success"}');
    }
  });
//This needs to be looked at
  wmysql.query('INSERT INTO stats (gymid,userid,type) SELECT DISTINCT g.id,s.userid,1 FROM gyms g,schedule s WHERE g.token = "' + req.body.token + '" AND s.id = ' + req.body.sid, function(err, result, fields) {
  if (err) {
    res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
  } else {
    res.send('{"stats": "success"}');
    }
  });  
});
*/

app.post('/api/getAllClasses/', function(req, res){
  rmysql.query('SELECT id,gymid,service,price,monday,tuesday,wednesday,thursday,friday,saturday,sunday FROM classes ORDER BY service DESC LIMIT 20 OFFSET ' + req.body.offset, function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "no matching gym"}');
    } else {
      res.send(result);
    }
  });
});


app.get('/api/getClasses/:gid', function(req, res){
  rmysql.query('SELECT id,gymid,service,price,monday,tuesday,wednesday,thursday,friday,saturday,sunday AS time FROM classes WHERE gymid = ' + req.params.gid, function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "no matching gym"}');
    } else {
      res.send(result);
    }
  });
});

app.post('/api/getDayClasses/', function(req, res){
  rmysql.query('SELECT id,service,price,' + req.body.day + ' FROM classes WHERE gymid = ' + req.body.gymid + ' AND `' + req.body.day + '` IS NOT NULL AND `' + req.body.day + '` <> ""', function(err, result, fields) {
    if(err) {
      res.send('{"status": "failed", "message": "no matching gym"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/getClassParticipants/', function(req, res) {
  rmysql.query('SELECT u.id,u.first_name,u.last_name FROM users u INNER JOIN schedule s ON u.id = s.userid INNER JOIN gymUsers gu ON s.gymid = gu.gymid WHERE s.classid = ' + req.body.classid + ' AND DATE(s.datetime) = "' + req.body.datetime + '" AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    if(err) {
      res.send('{"status": "failed", "message": "no matching class"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/addClass/', function(req, res){
  wmysql.query('INSERT INTO classes (gymid,service,price,monday,tuesday,wednesday,thursday,friday,saturday,sunday) SELECT gu.gymid,' + wmysql.escape(req.body.service) + ',' + req.body.price + ',"' + req.body.monday + '","' + req.body.tuesday + '","' + req.body.wednesday + '","' + req.body.thursday + '","' + req.body.friday + '","' + req.body.saturday + '","' + req.body.sunday + '" FROM gyms g INNER JOIN gymUsers gu ON gu.gymid = g.id WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
    var cid = result.insertId;
   if (err) {
      res.send('{"status": "failed", "message": "unable to add class"}');
    } else {
      res.send('{"stats": "success", "message": "' + cid + '"}');
    }
  });
});


app.get('/api/getClass/:cid', function(req, res){
  rmysql.query('SELECT id,gymid,service,price,monday,tuesday,wednesday,thursday,friday,saturday,sunday FROM classes WHERE id = ' + req.params.cid, function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "no matching class"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/updateClass/', function(req, res){
  wmysql.query('UPDATE classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid SET service = ' + wmysql.escape(req.body.service) + ',price = "' + req.body.price + '", monday = "' + req.body.monday + '", tuesday = "' + req.body.tuesday + '", wednesday = "' + req.body.wednesday + '", thursday = "' + req.body.thursday + '", friday = "' + req.body.friday + '", saturday = "' + req.body.saturday + '", sunday = "' + req.body.sunday + '" WHERE c.id = ' + req.body.classid + ' AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "unable to update class"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.del('/api/deleteClass/', function(req, res){ 
   wmysql.query('DELETE c FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE c.id = ' + req.body.classid + ' AND gu.token = "' + req.header('token') + '"', function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message": "Unable to delete class"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.post('/api/addGym/', function(req, res){
  require('crypto').randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    wmysql.query('INSERT INTO gyms (name) VALUES(' + req.body.name +')', function(err, result, fields) {
     if (err) {
        res.send('{"status": "failed", "message": "unable to add gym"}');
      } else {
        var gymid = result.insertId;
        wmysql.query('INSERT INTO gymUsers (gymid,username,password,first_name,last_name,groupid,token) VALUES(' + gymid +',"' + req.body.username + '",' + req.body.password + ',' + req.body.firstName + ',' + req.body.lastName + ',1,"' + token + '")', function(err, result, fields) {
          if (err) {
            res.send('{"status": "failed", "message": "unable to add gym user"}');
          } else {
            wmysql.query('INSERT INTO disbursement (gymid,type,paylimit) SELECT id,"check",1000 FROM gyms WHERE token = ' + req.header('token'), function(err, result, fields) {
              if (err) {
                res.send('{"status": "failed", "message": "unable to update disbursement"}');
              } else {
                res.send('{"status": "success"}');
              }
            });
          }
        });  
      }
    }); 
  });
});

/* old code app.post('/api/addGym/', function(req, res){
  require('crypto').randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    wmysql.query('INSERT INTO gyms (name) VALUES("' + req.body.name +'")', function(err, result, fields) {
     if (err) {
        res.send('{"status": "failed", "message": "Add gym failed"}');
      } else {
        var gymid = result.insertId;
        wmysql.query('INSERT INTO gymUsers (gymid,username,password,first_name,last_name,groupid,token) VALUES(' + gymid +',"' + req.body.username + '","' + req.body.password + '","' + req.body.firstName + '","' + req.body.lastName + '",0,"' + token + '")', function(err, result, fields) {
        if (err) {
          res.send('{"status": "failed", "message":"Add gym User failed"}');
        } else {
     	  res.send('{"status": "success"}');
	   }
        }); 
      }
    });
  });
});*/ 




app.post('/api/addGymUser/', function(req, res){
  wmysql.query('INSERT INTO gymUsers (gymid,token,username,password,first_name,last_name,group,created,lastlogin) SELECT id,token,"' + req.body.username +  '","' + req.body.firstName + '","' + req.body.lastName + '",' + req.body.group + ',NOW(),NOW() FROM gyms WHERE token = "' + req.body.token, function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "Unable to add"}');
    } else {
      res.send('{"status": "success"}');
    }
  });
});


app.post('/api/updateGymEmployee/', function(req, res) {
  rmysql.query('SELECT password FROM gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
    if(result.password == req.body.cpass) {
      wmysql.query('UPDATE gymUsers set password = "' + req.body.npass + '" WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
        if(err) {
          res.send('{"status": "failed", "message": "Unable to update"}');
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
  wmysql.query('DELETE FROM gymUsers WHERE id = ' + req.body.eid, function(err, result, fields) {
    if(err) {
      res.send('{"status": "failed", "message": "Unable to delete"}');
    } else {
      res.send('{"status": "success"}');
    }
  });
});



app.post('/api/addGymImage/', function(req, res){
  fs.writeFile('images/' + req.body.iName, new Buffer(req.body.image, "base64"), function(err) {
    CFclient.setAuth(function (err) {
      if(err) {
        res.send('{"status": "failed", "message": "unable to upload"}');
      } else {
        CFclient.addFile('gymImages', { remote: req.body.iName, local: 'images/' + req.body.iName }, function (err, uploaded) {
	  console.log(uploaded);
          if(err) {
            res.send('{"status": "failed", "message": "unable to upload"}');
          } else {
            wmysql.query('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid SET g.image = "' + CFcontainer + req.body.iName + '" WHERE gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
              if(err) {
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
  wmysql.query('UPDATE gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid set g.name = "' + req.body.name + '",g.address = "' + req.body.address + '",g.city = "' + req.body.city + '",g.state = "' + req.body.state + '",g.zipcode = "' + req.body.zipcode + '",g.phone = "' + req.body.phone + '",g.email = "' + req.body.email + '",g.contact = "' + req.body.contact + '",g.image = "' + req.body.image + '",g.facebook = "' + req.body.facebook + '",g.twitter = "' + req.body.twitter + '",g.googleplus = "' + req.body.googleplus + '",g.url = "' + req.body.url + '",g.complete = true WHERE gu.token = "' + req.header('token') + '"', function(err, result, fields) {
      if (err) {
        res.send('{"status": "failed", "message": "Unable to update"}');
      } else {
        wmysql.query('UPDATE hours h INNER JOIN gymUsers ug ON h.gymid = ug.gymid set monday = "' + req.body.monday + '",tuesday = "' + req.body.tuesday + '", wednesday = "' + req.body.wednesday + '",thursday = "' + req.body.thursday + '",friday = "' + req.body.friday + '",saturday = "' + req.body.saturday + '",sunday = "' + req.body.sunday + '" WHERE ug.token = "' + req.header('token') + '"', function(err, result, fields) {
          if (err) {
            res.send('{"status": "failed", "message": "Unable to update"}');
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
});


app.get('/api/gymBalance/', function(req, res){
    rmysql.query('SELECT balance FROM gyms g INNER JOIN gymUsers gu ON g.id = gu.gymid WHERE gu.token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "Unable to get balance"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/gymSchedule/', function(req, res){
    rmysql.query('SELECT u.id AS uid,s.id AS sid,u.first_name,u.last_name,c.service,DATE_FORMAT(s.datetime, "%M %D %Y ") AS date,TIME(s.datetime) AS time FROM schedule s INNER JOIN users u ON s.userid = u.id INNER JOIN classes c ON s.classid = c.id INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = "' + req.header('token') + '" AND s.datetime > "' + req.body.start + '" AND s.datetime < "' + req.body.end + '" ORDER BY s.datetime', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "Unable to get schedule"}');
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
  rmysql.query('SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
    if(result.length < 1) { 
      res.send('{"status": "failed", "message":"invalid token"}');
    } else {
      wmysql.query('INSERT INTO gymTags (gymid,tag) VALUES (' + req.body.gymid + ',"' + req.body.tag + '")', function(err, result, fields) {
        if(err) {
          res.send('{"status": "failed", "message":"unable to add tag"}');
        } else {
          res.send('{"status": "success", "tid": "' + result.insertId + '"}');
        }
      });
    }
  });
});

app.del('/api/deleteTag/', function(req, res){
  rmysql.query('SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
    if(result.length < 1) { 
      res.send('{"status": "failed", "message":"invalid token"}');
    } else {
      wmysql.query('DELETE FROM gymTags WHERE id = ' + req.body.tid, function(err, result, fields) {
        if(err) {
          res.send('{"status": "failed", "message":"unable to delete tag"}');
        } else {
          res.send('{"status": "success"');
        }
      });
    }
  });
});


app.del('/api/deleteAccount/', function(req, res){  
  wmysql.query('DELETE s FROM schedule s INNER JOIN users u WHERE userid = ' + req.body.uid + ' AND u.' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
     res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      wmysql.query('DELETE b FROM balance b INNER JOIN users u WHERE b.userid = ' + req.body.uid + ' AND u.' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
        if (err) {
          res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
        }  else {
          wmysql.query('DELETE FROM users WHERE id = ' + req.body.uid + ' AND ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
          if (err) {
            res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
           } else {
            res.send('{"stats": "success"}');
            }
          });
        }
      });
    }
  });
});


app.post('/api/gymView', function(req, res){
  wmysql.query('INSERT INTO stats (gymid,userid,type) SELECT ' + req.body.gymid + ',id,0 FROM users WHERE ' + req.header('ltype') + '_token = "' + req.body.token + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "Unable to retreive"}');
    } else { 
      res.send('{"stats": "success"}');
      }
   });
});


app.get('/api/gymStats/', function(req, res){
  rmysql.query('SELECT(SELECT COUNT(*) FROM stats WHERE type = 1 AND gymid IN (SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '")) AS visits,(SELECT COUNT(*) FROM stats WHERE type = 0 AND gymid IN (SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '")) AS views,(SELECT AVG(price) FROM classes WHERE gymid IN (SELECT gymid FROM gymUsers WHERE token = "' + req.header('token') + '")) AS price', function(err, result, fields) {
  if (err) {
    res.send('{"status": "failed", "message": "Unable to retreive"}');
  } else {
    res.send(result);
    }
  });
});


app.post('/api/paymentTransaction/', function(req, res) {
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
          wmysql.query('INSERT INTO transactions (userid,refid,timestamp) VALUES (' + uid + ',"' + req.body.refid + '",NOW())', function(err, result, fields) {
            if (err) {
              res.send('{"status": "failed", "message": "unable to add transaction"}');
            } else {
              wmysql.query('UPDATE users SET balance = balance + ' + charge.amount/100 + ' WHERE id = ' + uid, function(err, result, fields) {
                if(err) {
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
  rmysql.query('SELECT refid FROM transactions t INNER JOIN users u WHERE u.' + req.header('ltype') + '_token = "' + req.header('token') + '" ORDER BY timestamp DESC LIMIT 5 OFFSET ' + req.body.offset, function(err, result, fields) {
    if(err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/newReward/', function(req, res) {
  if(req.body.network == 'facebook' || req.body.network == 'twitter') {
    rmysql.query('INSERT INTO rewards (userid,network,timestamp) VALUES(' + req.body.uid + ',"' + req.body.network + '",NOW())', function(err, result, fields) {
      if(err) {
        res.send('{"status": "failed", "message":"Already Applied"}');
      } else {
        res.send('{"status": "success"}');
      }
    });
  } else {
    res.send('{"status": "failed", "message":"Not a valid network"}')
  }
});


app.post('/api/aLogin/', function(req, res) {
   rmysql.query('SELECT au.userid FROM users u INNER JOIN adminUsers au ON u.id = au.userid WHERE u.email = AES_ENCRYPT("' + req.body.username + '","' + salt + '") AND au.password = "' + req.body.password + '"', function(err, result, fields) {

    if(err)
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    else {
      require('crypto').randomBytes(48, function(ex, buf) {
        var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
        var userid = result[0].userid;
        wmysql.query('UPDATE adminUsers set token = "' + token + '" WHERE userid = ' + userid, function(err, result, fields) {
          if(err) {
            res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
          } else {
            res.send('{"status": "success", "token": "' + token + '"}');
          }
        });
      });    
    }
  });
});


/*process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});*/

// Set Server to listen on specified ports
http.createServer(app).listen(80);
console.log("started server on 80");

https.createServer(options, app).listen(443);
console.log("started server on 443");

