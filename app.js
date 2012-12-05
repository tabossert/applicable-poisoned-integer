
/**
 * Module dependencies.
 */

var express = require('express')
  , crypto = require('crypto')
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


app.get('/api/gymSearch/:type/:value/:state', function(req, res){
  rmysql.query('SELECT id,name,address,city,state,zipcode,email,phone FROM gyms WHERE ' + req.params.type + ' = "' + req.params.value + '" AND state = "' + req.params.state +  '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
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
    console.log(fAddress); 
     cordinatesModel.find({loc : { '$near': [lat, lng], '$maxDistance': maxDistance }} , function(err, result) {
      if (err) {
        res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
      } else {
        result.forEach(function(index, array) {
          if(j < 1) {
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
  if (Array.isArray(req.body.terms)){
    len = req.body.terms.length;
  }
  query = query + ' INNER JOIN classes p ON g.id = p.gymid';
  for (i = 0; i < len; i++){
    var item = req.body.terms[i].replace(" ","");
    query = query + ' INNER JOIN classes ' +  item + ' ON g.id = ' + item + '.gymid';
    if(i == 0)
    {
      where = where + ' WHERE ' + item + '.service = "' + req.body.terms[i] + '"';
    } else {
      where = where + ' AND ' + item + '.service = "' + req.body.terms[i] + '"';
    } 
  }
  where = where + ' AND p.price < ' + req.body.rate;
    function runQuery(query,where,callback){
      rmysql.query('SELECT DISTINCT g.id,g.name,g.address,g.city,g.state,g.zipcode,g.phone,g.email FROM gyms g ' + query + where, function(err, result, fields) {
      if (err) {
        res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
      } else {
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
          res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
	} else {
		console.log(result);
		res.send(result);
	}
  });
});




app.get('/api/gymInfo/:gymId', function(req, res){
  rmysql.query('SELECT id,name,address,city,state,zipcode,phone,email,contact FROM gyms WHERE id = "' + req.params.gymId + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send(result);
    }
  });
});





app.get('/api/featuredGyms/', function(req, res){
  rmysql.query('SELECT name,address,city,state,zipcode,phone,email FROM gyms WHERE featured = true', function(err, result, fields) {
    if (err) {
     res.send('{"status": "failed", "message":"Already applied"}');
    } else {
      res.send(result);
    }
  });
});


app.get('/api/balance/', function(req, res){
  rmysql.query('SELECT balance FROM users WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
  if (err) {
     res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      console.log(result);
      res.send(result);

    }
  });
});




app.get('/api/disbursement/', function(req, res){
  rmysql.query('SELECT type,paylimit FROM disbursement d INNER JOIN gymUsers gu ON (d.gymid = gu.gymid) WHERE gu.token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/updateDisbursement/', function(req, res){
  wmysql.query('UPDATE disbursement d INNER JOIN gymUsers gu ON (d.gymid = gu.gymid) set d.type = ' + req.body.type + ',d.paylimit = ' + req.body.paylimit + ' WHERE gu.token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send('{"status": "success"}');
    }
  });
});


app.get('/api/paymentMethods/', function(req, res){
  rmysql.query('SELECT id,type FROM paymentmethod', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send(result);
    }
  });
});


app.get('/api/userPreferences/', function(req, res){
  rmysql.query('SELECT AES_DECRYPT(u.email,"' + salt + '") AS email,u.first_name,u.last_name,AES_DECRYPT(u.address,"' + salt + '") AS address,u.city,u.state,u.zipcode, b.amount,b.automatic,b.refillamount,b.schedule FROM users u INNER JOIN balance b ON u.id = b.userid WHERE u.' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields){
  if (err) {
    res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
  } else {
    res.send(result);
    }    
  });
});


app.post('/api/setPinCode/', function(req, res) {
  wmysql.query('UPDATE users SET phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND pincode = "' + req.body.pincode + '" WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message": "' + res.send(err) + '"}');
    } else {
      res.send('{"status": "success", "message": "' +req.body.phone + '"}');
    }
  }); 
});


app.post('/api/userSchedule/', function(req, res){
    console.log(req.body.start);
    rmysql.query('SELECT s.id,g.name,s.classid,c.service,DATE_FORMAT(datetime, "%m/%d/%Y ") as date, DATE_FORMAT(datetime,"%l:%i %p") as time FROM schedule s INNER JOIN classes c ON (s.classid = c.id) INNER JOIN gyms g ON (s.gymid = g.id) INNER JOIN users u ON u.id = s.userid WHERE u.' + req.header('ltype') + '_token = "' + req.header('token') + '" AND c.datetime > "' + req.body.start + '" AND c.datetime < "' + req.body.end + '" ORDER BY c.datetime', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      console.log(result);
      res.send(result);
    }
  });

});



app.post('/api/userCheckin/', function(req, res){
  rmysql.query('SELECT id FROM users WHERE phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND pincode = "' + req.body.pincode + '"', function(err, result, fields) {
    if(result.length < 1) {
      res.send('[{"status": "failed","message": "Invalid phone/pincode combination"}]');
    } else {
      var uid = result[0].id;
      rmysql.query('SELECT id FROM checkin WHERE userid = "' + uid + '" AND gymid = "' + req.body.gymid + '" AND DATE(datetime) = DATE(NOW())', function(err, result, fields) {
        if(result.length > 0) {
          res.send('[{"status": "failed","message": "Already Checked In Today"}]');
        } else {
          wmysql.query('UPDATE users AS ua INNER JOIN users AS ub ON ua.id = ub.id SET ua.balance = ub.balance - (SELECT rate FROM gyms WHERE id = "' + req.body.gymid + '") WHERE ua.phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND ua.pincode = "' + req.body.pincode + '" AND ( SELECT ua.balance - (SELECT rate FROM gyms WHERE id = "' + req.body.gymid + '")) > 0', function(err, wresult, fields) {
            if(wresult.affectedRows > 0) {
              wmysql.query('INSERT INTO checkin (userid,gymid,datetime) SELECT id,"' + req.body.gymid + '",NOW() FROM users WHERE phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND pincode = "' + req.body.pincode + '"', function(err, wresult, fields) {
                if (err) {
                  res.send('[{"status": "failed", "Checkin Error occured"}]');
                } else {
                  rmysql.query('SELECT "success" AS status,u.id AS uid,u.first_name,u.last_name,u.balance,s.id AS sid,g.name,s.classid,c.service,DATE_FORMAT(datetime, "%M %D %Y ") as date, DATE_FORMAT(datetime,"%l:%i %p") as time FROM schedule s INNER JOIN classes c ON s.classid = c.id INNER JOIN gyms g ON s.gymid = g.id INNER JOIN users u ON u.id = s.userid WHERE u.phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND u.pincode = AES_ENCRYPT("' + req.body.pincode + '","' + salt + '") AND c.datetime > NOW() ORDER BY c.datetime LIMIT 1', function(err, result, fields) {
                    if(result.length < 1) {
                      rmysql.query('SELECT "success" AS status,first_name,last_name,balance FROM users WHERE phone = AES_ENCRYPT("' + req.body.phone + '","' + salt + '") AND pincode = "' + req.body.pincode + '"', function(err, result, fields) {
                        if(result.length < 1) {
                          res.send('[{"status": "failed","message": "unknown"}]');
                        } else {
                          res.send(result);
                        }
                      });
                    } else {
                      res.send(result);
                    }
                  });
                }
              });
            } else {
              res.send('[{"status": "failed","message": "Insufficient balance"}]');
            }
          });
        }
      });
    }
  });
});


app.post('/api/userSignup/', function(req, res){
 console.log(req);
  engageAPI.authInfo(req.body.token, true, function(err, data) {
      if(err) {
        console.log('ERROR: ' + err.message);
        res.send('[{"status": "invalidToken"}]');
        return;
      }
      else {
	console.log(data);
        wmysql.query('SELECT email FROM users WHERE email = AES_ENCRYPT("' + data.profile.email + '","' + salt + '")', function(err, result, fields) {
	console.log(result);
          require('crypto').randomBytes(48, function(ex, buf) {
          var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
            if(result.length < 1) {
              wmysql.query('INSERT INTO users (email,first_name,last_name,' + req.body.ltype + '_token,created,lastlogin) VALUES (AES_ENCRYPT("' + data.profile.email + '","' + salt + '"),"' + data.profile.name.givenName + '","' + data.profile.name.familyName + '","' + token + '",NOW(),NOW())', function(err, result, fields) {
              if (err) {
                res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
              } else {
	        wmysql.query('INSERT INTO balance (userid,amount,automatic,refillamount) VALUES(' + result.insertId + ',0,false,0)', function(err, result, fields) {
	          if (err) {
                res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
              } else {
                res.send('[{"token": "' + token + '"}]');
	            }
	          });
          }
        });
      } else {
	  console.log(req.body.ltype);
          wmysql.query('UPDATE users SET ' + req.body.ltype + '_token = "' + token + '", lastlogin = NOW() WHERE email = AES_ENCRYPT("' + data.profile.email + '","' + salt + '")', function(err, result, fields) {
            if (err) {
              res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
            } else {
              res.send('[{"token": "' + token + '"}]');
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
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');	
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
	  res.send('[{"status": "failed", "message":"' + res.send(err) + '"}]');
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
  wmysql.query('UPDATE users SET email = AES_ENCRYPT("' + req.body.email + '","' + salt + '"), first_name = "' + req.body.first_name + '", last_name = "' + req.body.last_name + '", address = AES_ENCRYPT("' + req.body.address + '","' + salt + '"), city = "' + req.body.city + '", state = "' + req.body.state + '", zipcode = "' + req.body.zipcode + '", rate = "' + req.body.rate + '" WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) { 
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.post('/api/addEvent/', function(req, res){
  wmysql.query('INSERT INTO schedule (userid,gymid,classid,price) SELECT id,' + req.body.gymid + ',' + req.body.classid + ',' + req.body.price + ' FROM users WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.del('/api/deleteEvent/', function(req, res){  
  wmysql.query('DELETE s FROM schedule s INNER JOIN users u ON s.userid = u.id WHERE s.id = ' + req.body.sid + ' AND u.' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
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

app.get('/api/getClasses/:gid', function(req, res){
  rmysql.query('SELECT id,gymid,service,price,DATE_FORMAT(datetime, "%M %D %Y ") AS date,TIME(datetime) AS time FROM classes WHERE gymid = ' + req.params.gid, function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/addClass/', function(req, res){
  wmysql.query('INSERT INTO classes (gymid,service,price,datetime) SELECT gu.gymid,"' + req.body.service + '",g.rate,"' + req.body.datetime + '" FROM gyms g,gymUsers gu WHERE token = "' + req.headers.token + '"', function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.get('/api/getClass/:cid', function(req, res){
  console.log(req.params.cid);
  rmysql.query('SELECT id,gymid,service,price,DATE_FORMAT(datetime, "%M %D %Y ") AS date,TIME(datetime) AS time FROM classes WHERE id = ' + req.params.cid, function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/updateClass/', function(req, res){
  wmysql.query('UPDATE classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid SET service = "' + req.body.service + '",price = "' + req.body.price + '", datetime = "' + req.body.datetime + '" WHERE c.id = ' + req.body.classid + ' AND gu.token = "' + req.header('token') + '"', function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.del('/api/deleteClass/', function(req, res){  
   wmysql.query('DELETE c FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE c.id = ' + req.body.classid + ' AND gu.token = "' + req.header('token') + '")', function(err, result, fields) {
   if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send('{"stats": "success"}');
    }
  });
});


app.post('/api/addGym/', function(req, res){
  require('crypto').randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
    wmysql.query('INSERT INTO gyms (name) VALUES("' + req.body.name +'")', function(err, result, fields) {
     if (err) {
        res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
      } else {
        var gymid = result.insertId;
        wmysql.query('INSERT INTO gymUsers (gymid,username,password,first_name,last_name,groupid,token) VALUES(' + gymid +',"' + req.body.username + '","' + req.body.password + '","' + req.body.firstName + '","' + req.body.lastName + '",0,"' + token + '")', function(err, result, fields) {
        if (err) {
          res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
        } else {
     	  res.send('{"status": "success"}');
	   }
        }); 
      }
    });
  });
});


app.post('/api/addGymProfile/', function(req, res){
  wmysql.query('UPDATE gyms set address = "' + req.body.address + '",city = "' + req.body.city + '",state = "' + req.body.state + '",zipcode = "' + req.body.zipcode + '",phone = "' + req.body.phone + '",email = "' + req.body.email + '",contact = "' + req.body.contact + '",complete = true WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      wmysql.query('UPDATE hours h INNER JOIN gymUsers ug ON h.gymid = ug.gymid set monday = "' + req.body.monday + '",tuesday = "' + req.body.tuesday + '", wednesday = "' + req.body.wednesday + '",thursday = "' + req.body.thursday + '",friday = "' + req.body.friday + '",saturday = "' + req.body.saturday + '",sunday = "' + req.body.sunday + '" WHERE ug.token = "' + req.header('token') + '"', function(err, result, fields) {
      if (err) {
        res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
      } else {
        wmysql.query('INSERT INTO disbursement (gymid,type,paylimit) SELECT id,' + req.body.type + ',' + req.body.limit + ' FROM gyms WHERE token = "' + req.header('token') + '"', function(err, result, fields) {
            if (err) {
              res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
            } else {
              geo.geocoder(geo.google, req.body.address + ',' + req.body.city + ',' + req.body.state, false,  function(fAddress,lat,lng) {
              cord = new cordinatesModel({
                "gymid" : req.body.gymid,
                "loc" : {"lat" : lat, "lng" : lng},
                });
              cord.save(function (err) {
              if (err) {
                res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
              } else {
                res.send('{"status": "success"}');
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
  wmysql.query('INSERT INTO gymUsers (gymid,token,username,password,first_name,last_name,group,created,lastlogin) SELECT id,token,"' + req.body.username +  '","' + req.body.firstName + '","' + req.body.lastName + '",' + req.body.group + ',NOW(),NOW() FROM gyms WHERE token = "' + req.body.token, function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
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
          res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
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
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send('{"status": "success"}');
    }
  });
});


app.post('/api/updateGym/', function(req, res){
  wmysql.query('UPDATE gyms g INNER JOIN gymUsers ug ON g.id = gu.gymid set name = "' + req.body.name + '",address = "' + req.body.address + '",city = "' + req.body.city + '",state = "' + req.body.state + '",zipcode = "' + req.body.zipcode + '",phone = "' + req.body.phone + '",email = "' + req.body.email + '",contact = "' + req.body.contact + '" WHERE ug.token = "' + req.header('token') + '"', function(err, result, fields) {
      if (err) {
        res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
      } else {
        wmysql.query('UPDATE hours h INNER JOIN gymUsers ug ON h.gymid = ug.gymid set monday = "' + req.body.monday + '",tuesday = "' + req.body.tuesday + '", wednesday = "' + req.body.wednesday + '",thursday = "' + req.body.thursday + '",friday = "' + req.body.friday + '",saturday = "' + req.body.saturday + '",sunday = "' + req.body.sunday + '" WHERE ug.token = "' + req.header('token') + '"', function(err, result, fields) {
          if (err) {
            res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
          } else {
            geo.geocoder(geo.google, req.body.address + ',' + req.body.city + ',' + req.body.state, false,  function(fAddress,lat,lng) {
	             cordinatesModel.findOne({gymid: req.body.gid}, function(err, p) {
	               if(!p)
	                 res.send('{"status": "failed", "message":"No Document Found"}');  
	               else { 
	                 console.log(lat);
	                 console.log(lng);
	                 p.loc.lat = lat;
	                 p.loc.lng = lng;
	    
	                 p.save(function(err) {
	                   if(err) 
	                     res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
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
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send(result);
    }
  });
});


app.post('/api/gymSchedule/', function(req, res){
  rmysql.query('SELECT u.id AS uid,s.id AS sid,u.first_name,u.last_name,s.redeemed,c.service,DATE_FORMAT(c.datetime, "%M %D %Y ") AS date,TIME(c.datetime) AS time FROM schedule s INNER JOIN users u ON s.userid = u.id INNER JOIN classes c ON s.classid = c.id INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = "' + req.header('token') + '" AND c.datetime > "' + req.body.start + '" AND c.datetime < "' + req.body.end + '" ORDER BY c.datetime', function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else {
      res.send(result);
    }
  });
});


app.get('/api/getTags/', function(req, res){
  rmysql.query('SELECT id,tag FROM gymTags WHERE gymid = ' + req.body.gymid, function(err, result, fields) {
    if (err) {
      res.send('{"status": "failed", "message":"unable to retrieve tags"}');
    } else {
      res.send(result);
    }
  });  
});

app.post('/api/addTag/', function(req, res){
  wmysql.query('INSERT INTO gymTags (gymid,tag) VALUES (' + req.body.gymid + ',"' + req.body.tag + '")', function(err, result, fields) {
    if(err) {
      res.send('{"status": "failed", "message":"unable to add tag"}');
    } else {
      res.send('{"status": "success", "tid": "' + result.insertId + '"}');
    }
  });
});

app.del('/api/deleteTag/', function(req, res){
  wmysql.query('DELETE FROM gymTags WHERE id = ' + req.body.tid, function(err, result, fields) {
    if(err) {
      res.send('{"status": "failed", "message":"unable to delete tag"}');
    } else {
      res.send('{"status": "success"');
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
      res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
    } else { 
      res.send('{"stats": "success"}');
      }
   });
});


app.get('/api/gymStats/', function(req, res){
  rmysql.query('SELECT(SELECT COUNT(*) FROM stats WHERE type = 1 AND gymid IN (SELECT id FROM gyms WHERE token = "' + req.header('token') + '")) AS visits,(SELECT COUNT(*) FROM stats WHERE type = 0 AND gymid IN (SELECT id FROM gyms WHERE token = "' + req.header('token') + '")) AS views,(SELECT AVG(price) FROM classes WHERE gymid IN (SELECT id FROM gyms WHERE token = "' + req.header('token') + '")) AS price', function(err, result, fields) {
  if (err) {
    res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
  } else {
    res.send(result);
    }
  });
});


app.post('/api/paymentTransaction/', function(req, res) {
  rmysql.query('SELECT id AS uid FROM users WHERE ' + req.header('ltype') + '_token = "' + req.header('token') + '"', function(err, result, fields) {
  if (err) {
    res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
  } else {
    wmysql.query('INSERT INTO transactions (userid,refid,timestamp) VALUES (' + result[0].uid + ',"' + req.body.refid + '",NOW())', function(err, result, fields) {
        if (err) {
         res.send('{"status": "failed", "message":"' + res.send(err) + '"}');
        } else {
          res.send('{"stats": "success"}');  
        }
      });
    }
  });
});

app.post('/api/getTransaction/', function(req, res) {
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


/*process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});*/

// Set Server to listen on specified ports
http.createServer(app).listen(80);
console.log("started server on 80");

https.createServer(options, app).listen(443);
console.log("started server on 443");

