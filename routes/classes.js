/**
 *  Routes related to classes
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
  var colorArr = ['#FF0000','#8A0808','FF8000','#F7FE2E','#00FF00','#0B610B','#00FFFF','#0000FF','#0B0B61','#FA5882','#380B61','#585858']


  function getColor(token,callback) {
    console.log('SELECT c.color FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = ' + token + 'ORDER BY c.id DESC LIMIT 1')
    rmysql.query('SELECT c.color FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = ' + token + 'ORDER BY c.id DESC LIMIT 1', function(err, result, fields) {
      console.log(result)
      colorIndex = colorArr.indexOf(result[0].color) + 1;
      console.log(colorIndex)
      callback(colorArr[colorIndex]);
    });
  }

  app.get('/api/getClassList/', function(req, res){
    rmysql.query('SELECT c.id,c.gymid,c.service,c.duration,c.price,c.spots FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE gu.token = ' + wmysql.escape(req.header('token')) + ' ORDER BY service', function(err, result, fields) {
     if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no matching gym"}');
      } else {
        res.send(result);
      }
    });
  });


  app.post('/api/getClassesByPartner/', function(req, res) {
    console.log('SELECT sc.id AS scid,c.id AS cid,c.service,c.color,sc.active,sc.price,sc.spots,sc.datetime FROM classes c INNER JOIN scheduledClass sc ON c.id = sc.classid INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE sc.datetime >= ' + rmysql.escape(req.body.start) + ' AND sc.datetime <= ' + rmysql.escape(req.body.end) + ' AND  gu.token = ' + rmysql.escape(req.header('token')))
    rmysql.query('SELECT sc.id AS scid,c.id AS cid,c.service,c.color,sc.active,sc.price,sc.spots,sc.datetime FROM classes c INNER JOIN scheduledClass sc ON c.id = sc.classid INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE sc.datetime >= ' + rmysql.escape(req.body.start) + ' AND sc.datetime <= ' + rmysql.escape(req.body.end) + ' AND  gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
     if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no matching gym"}');
      } else {
        res.send(result);
      }
    });
  });


  app.get('/api/getClasses/:gid', function(req, res){
    try {
      check(req.params.gid).isNumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    var i = 0;
    var search = "";
    if(req.query.search !== undefined) {
      var terms = req.query.search.split(',');
      len = terms.length;
      for (i = 0; i < len; i++){
        search = search + '"' + terms[i] + '",';
      }
    }
    search = search + "service";

    rmysql.query('select id,gymid,service,instructor,duration,price,spots,`desc`,image from classes where gymid = ' + req.params.gid + ' ORDER BY FIELD(service,' + search + ',service) ASC', function(err, result, fields) {
     if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no results"}');
      } else {
        res.send(result);
      }
    });
  });


  app.post('/api/classSize/', function(req, res){
    rmysql.query('SELECT sc.spots - COUNT(s.sclassid) AS openSpots,sc.spots AS maxSpots FROM schedule s INNER JOIN scheduledClass sc ON s.sclassid = sc.id WHERE s.sclassid = ' + req.body.classid + ' AND s.datetime = "' + req.body.datetime + '"', function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no class matching id"}');
      } else {
        res.send(result);
      }
    });
  });


  app.post('/api/getDayClasses/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    console.log('SELECT sc.id,sc.service,sc.duration,sc.instructor,sc.price,sc.datetime,sc.active FROM scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid WHERE DATE(sc.datetime) >= ' + wmysql.escape(req.body.date) + ' AND gu.token = ' + rmysql.escape(req.header('token')))
    rmysql.query('SELECT sc.id,sc.service,sc.duration,sc.instructor,sc.price,sc.datetime,sc.active FROM scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid WHERE DATE(sc.datetime) = ' + wmysql.escape(req.body.date) + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no classes"}');
      } else {
        res.send(result);
      }
    });
  });



  app.post('/api/getNextClasses/', function(req, res) {
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    console.log('SELECT sc.id,sc.classid,sc.service,sc.active,sc.price,sc.spots,sc.datetime FROM scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid WHERE sc.datetime >= ' + rmysql.escape(req.body.start) + ' AND sc.datetime <= ' + rmysql.escape(req.body.end) + ' AND  gu.token = ' + rmysql.escape(req.header('token')) + ' ORDER BY sc.datetime')
    rmysql.query('SELECT sc.id,sc.classid,sc.service,sc.active,sc.price,sc.spots,sc.datetime FROM scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid WHERE sc.datetime >= ' + rmysql.escape(req.body.start) + ' AND sc.datetime <= ' + rmysql.escape(req.body.end) + ' AND  gu.token = ' + rmysql.escape(req.header('token')) + ' ORDER BY sc.datetime', function(err, result, fields) {
      console.log(result)
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no matching classes"}');
      } else {
        res.send(result);
      }
    });
  });


  app.post('/api/scheduledClassAdd/', function(req, res) {
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT gymid FROM gymUsers WHERE token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no matching gym"}');
      } else {
        gymid = result[0].gymid;
        for( var item in req.body.classObj) {
          console.log('INSERT INTO scheduledClass (classid,datetime,active,price,gymid,spots,service,instructor,image,daypass) SELECT ' + wmysql.escape(req.body.classObj[item].classid) + ',' + wmysql.escape(req.body.classObj[item].datetime) + ',1,price,gymid,spots,service,instructor,image,daypass FROM classes WHERE id = ' + wmysql.escape(req.body.classObj[item].classid) + ' AND gymid = ' + gymid)
          wmysql.query('INSERT INTO scheduledClass (classid,datetime,active,price,gymid,spots,service,instructor,image,daypass) SELECT ' + wmysql.escape(req.body.classObj[item].classid) + ',' + wmysql.escape(req.body.classObj[item].datetime) + ',1,price,gymid,spots,service,instructor,image,daypass FROM classes WHERE id = ' + wmysql.escape(req.body.classObj[item].classid) + ' AND gymid = ' + gymid, function(err, result, fields) {    
            if(err) {
              res.end('{"status": "failed", "message": "unable to add classes"}');
            } else {
              res.end('{"status": "success"}');
            }
          });
        }
      }
    }); 
  });       



  app.get('/api/getUpcomingClasses/:cid', function(req, res) {
    try {
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    console.log('SELECT sc.id as scid,sc.datetime,(SELECT sc.spots - COUNT(s.sclassid) AS openSpots FROM schedule s INNER JOIN scheduledClass sc ON s.sclassid = sc.id WHERE sc.id = scid) AS openCount FROM scheduledClass sc INNER JOIN classes c ON sc.classid = c.id WHERE c.id = ' + rmysql.escape(req.params.cid) + ' AND sc.datetime >= "' + moment().utc().format('YYYY-MM-DD HH:mm:ss') + '"')
    rmysql.query('SELECT sc.id as scid,sc.datetime,(SELECT sc.spots - COUNT(s.sclassid) AS openSpots FROM schedule s INNER JOIN scheduledClass sc ON s.sclassid = sc.id WHERE sc.id = scid) AS openCount FROM scheduledClass sc INNER JOIN classes c ON sc.classid = c.id WHERE c.id = ' + rmysql.escape(req.params.cid) + ' AND sc.datetime >= "' + moment().utc().format('YYYY-MM-DD HH:mm:ss') + '"', function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no matching class"}');
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
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    console.log('SELECT u.id,s.id AS sid,s.checkin,u.first_name,u.last_name FROM users u INNER JOIN schedule s ON u.id = s.userid INNER JOIN gymUsers gu ON s.gymid = gu.gymid WHERE s.sclassid = ' + req.body.classid + ' AND gu.token = ' + rmysql.escape(req.header('token')));
    rmysql.query('SELECT u.id,s.id AS sid,s.checkin,u.first_name,u.last_name FROM users u INNER JOIN schedule s ON u.id = s.userid INNER JOIN gymUsers gu ON s.gymid = gu.gymid WHERE s.sclassid = ' + req.body.classid + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no results"}');
      } else {
        res.send(result);
      }
    });
  });


  app.post('/api/addClass/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    var cid = 0;
    var color = "";
    if(req.body.spots == null) {
      var spots = 30;
    } else {
      var spots = req.body.spots
    }
    getColor(wmysql.escape(req.header('token')),function(cb) {
      color = cb;
      console.log('INSERT INTO classes (gymid,service,image,duration,price,spots,`desc`,color) SELECT gymid,' + wmysql.escape(req.body.service) + ',' + wmysql.escape(req.body.image) + ',' + wmysql.escape(req.body.duration) + ',' + req.body.price + ',' + spots + ',' + wmysql.escape(req.body.description) + ',' + color + ' FROM gymUsers WHERE token = ' + wmysql.escape(req.header('token')))
      wmysql.query('INSERT INTO classes (gymid,service,image,duration,price,spots,`desc`,color) SELECT gymid,' + wmysql.escape(req.body.service) + ',' + wmysql.escape(req.body.image) + ',' + wmysql.escape(req.body.duration) + ',' + req.body.price + ',' + spots + ',' + wmysql.escape(req.body.description) + ',"' + color + '" FROM gymUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
       if(err || result.affectedRows < 1) {
          res.end('{"status": "failed", "message": "unable to add class"}');
        } else {
          cid = result.insertId;
          var keys = Object.keys( req.body.days );
          keys.forEach(function(key) {
          req.body.days[key].forEach(function(time) {
              console.log('INSERT INTO classTimes (classid,gymid,weekday,time) SELECT ' + cid + ',gymid,' + wmysql.escape(key) + ',' + wmysql.escape(time) + ' FROM gymUsers WHERE token = ' + wmysql.escape(req.header('token')));
              wmysql.query('INSERT INTO classTimes (classid,gymid,weekday,time) SELECT ' + cid + ',gymid,' + wmysql.escape(key) + ',' + wmysql.escape(time) + ' FROM gymUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
                if(err || result.affectedRows < 1) {
                  res.end('{"status": "failed", "message": "unable to add class"}');
                }     
              });
            });
          });
          res.end('{"status": "success", "message": "' + cid + '"}');
        }
      });
    });
  });


  app.get('/api/getClass/:cid', function(req, res){
    try {
      check(req.params.cid).isNumeric() 
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    //console.log('SELECT c.id,c.gymid,c.service,c.duration,c.price,c.spots,c.instructor,c.desc,g.address,g.city,g.state,g.zipcode FROM classes c INNER JOIN gyms g ON c.gymid = g.id INNER JOIN hours h ON g.id = h.gymid WHERE c.id = ' + req.params.cid);
    rmysql.query('SELECT c.id,c.gymid,c.service,c.duration,c.price,c.spots,c.instructor,c.desc,g.address,g.city,g.state,g.zipcode,g.phone FROM classes c INNER JOIN gyms g ON c.gymid = g.id INNER JOIN hours h ON g.id = h.gymid WHERE c.id = ' + req.params.cid, function(err, result, fields) {
     if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no matching class"}');
      } else {
        res.send(result);
      }
    });
  });


  app.get('/api/getClassTimes/:cid', function(req, res){
    try {
      check(req.params.cid).isNumeric() 
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT weekday,GROUP_CONCAT(time) AS time FROM classTimes WHERE classid = ' + req.params.cid + ' GROUP BY weekday ORDER BY FIELD(weekday,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday");', function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "no matching class"}');
      } else {
        res.send(result);
      }
    });
  });


  app.put('/api/updateClass/', function(req, res){
    try {
      check(req.header('token')).notNull();
      //check(req.body.price).len(1,7).isNumeric();
      check(req.body.classid).isNumeric();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    if(req.body.spots == null) {
      var spots = 30;
    } else {
      var spots = req.body.spots
    }
    console.log('UPDATE classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid SET service = ' + wmysql.escape(req.body.service) + ',image = ' + wmysql.escape(req.body.image) + ',instructor = ' + wmysql.escape(req.body.instructor) + ',duration = "' + req.body.duration + '",price = "' + req.body.price + '",spots = ' + spots + ',desc = ' + wmysql.escape(req.body.description) + ' WHERE c.id = ' + req.body.classid + ' AND gu.token = ' + wmysql.escape(req.header('token')));
    wmysql.query('UPDATE classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid SET service = ' + wmysql.escape(req.body.service) + ',image = ' + wmysql.escape(req.body.image) + ',instructor = ' + wmysql.escape(req.body.instructor) + ',duration = "' + req.body.duration + '",price = "' + req.body.price + '",spots = ' + spots + ',`desc` = ' + wmysql.escape(req.body.description) + ' WHERE c.id = ' + req.body.classid + ' AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
     if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "unable to update class"}');
      } else {
        wmysql.query('DELETE FROM classTimes WHERE classid = ' + req.body.classid);
        var keys = Object.keys( req.body.days );
        keys.forEach(function(key) {
        req.body.days[key].forEach(function(time) {
            wmysql.query('INSERT INTO classTimes (classid,gymid,weekday,time) SELECT ' + req.body.classid + ',gymid,' + wmysql.escape(key) + ',' + wmysql.escape(time) + ' FROM gymUsers WHERE token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
              if(err || result.affectedRows < 1) {
                res.end('{"status": "failed", "message": "unable to add class"}');
              }     
            });
          });
        });
        res.end('{"status": "success", "message": "' + req.body.classid + '"}');
      }
    });
  });


  app.del('/api/deleteClass/:cid', function(req, res){  
    try {
      check(req.header('token')).notNull();
      check(req.params.cid).isNumeric()
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    wmysql.query('DELETE c FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE c.id = ' + req.params.cid + ' AND gu.token = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.affectedRows < 1) {
        res.end('{"status": "failed", "message": "unable to delete class"}');
      } else {
        res.end('{"status": "success"}');
      }
    });
  });  

  app.put('/api/cancelClass/', function(req, res) {
    rmysql.query('SELECT id,active FROM scheduledClass WHERE classid = ' + req.body.classid + ' AND datetime = ' + rmysql.escape(req.body.datetime), function(err, result, fields) {
      if(result.length < 1) {
        wmysql.query('INSERT INTO scheduledClass (classid,datetime,active,price,gymid,spots) SELECT ' + req.body.classid + ',' + wmysql.escape(req.body.datetime) + ',0,c.price,c.gymid,c.spots FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE c.id = ' + req.body.classid + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
          if(err) {
            res.end('{"status": "failed", "message": "unable to cancel"}');
          } else {
            res.end('{"status": "success"}');
          }
        });
      } else {
        wmysql.query('UPDATE scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid SET active = 0 WHERE sc.classid = ' + req.body.classid + ' AND sc.datetime = ' + wmysql.escape(req.body.datetime) + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
          if(err) {
            res.send('{"status": "failed", "message": "unable to cancel"}');
          } else {
            res.end('{"status": "success"}');
          }
        }); 
      }
    });
  });


  app.put('/api/changeClass/', function(req, res) {
    rmysql.query('SELECT id,active FROM scheduledClass WHERE classid = ' + req.body.classid + ' AND datetime = ' + rmysql.escape(req.body.datetime), function(err, result, fields) {
      if(result.length < 1) {
        wmysql.query('INSERT INTO scheduledClass (classid,datetime,active,price,gymid,spots) SELECT ' + req.body.classid + ',' + wmysql.escape(req.body.datetime) + ',0,' + req.body.price + ',c.gymid,' + req.body.spots + ' FROM classes c INNER JOIN gymUsers gu ON c.gymid = gu.gymid WHERE c.id = ' + req.body.classid + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
          if(err) {
            res.end('{"status": "failed", "message": "unable to cancel"}');
          } else {
            res.end('{"status": "success"}');
          }
        });
      } else {
        wmysql.query('UPDATE scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid SET datetime = ' + req.body.datetime + ',spots = ' + req.body.spots + ',price = ' + req.body.price + ' WHERE sc.classid = ' + req.body.classid + ' AND sc.datetime = ' + wmysql.escape(req.body.datetime) + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send('{"status": "failed", "message": "unable to change class"}');
          } else {
            res.end('{"status": "success"}');
          }
        }); 
      }
    });
  });


  app.put('/api/reviveClass/', function(req, res) {
    rmysql.query('SELECT id,active FROM scheduledClass WHERE classid = ' + req.body.classid + ' AND datetime = ' + rmysql.escape(req.body.datetime), function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "unable to revive class"}');
      } else {
        console.log('UPDATE scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid SET active = 1 WHERE sc.classid = ' + req.body.classid + ' AND sc.datetime = ' + wmysql.escape(req.body.datetime) + ' AND gu.token = ' + rmysql.escape(req.header('token')))
        wmysql.query('UPDATE scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid SET active = 1 WHERE sc.classid = ' + req.body.classid + ' AND sc.datetime = ' + wmysql.escape(req.body.datetime) + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
          if(err || result.affectedRows < 1) {
            res.send('{"status": "failed", "message": "unable to revive"}');
          } else {
            res.end('{"status": "success"}');
          }
        }); 
      }
    });
  });


  app.get('/api/getUserSCID/', function(req, res){
    try {
      check(req.header('token')).notNull();
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT s.sclassid FROM schedule s INNER JOIN users u ON s.userid = u.id WHERE u.`' + req.header('ltype') + '_token` = ' + wmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
      }
    });
  });


  app.post('/api/getSCIDs/', function(req, res){
    try {
      check(req.header('token')).notNull();
      //check(req.body.classid).isNumeric();
      //check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      //check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    console.log('SELECT sc.id AS sid,sc.classid as cid,sc.datetime,sc.price,sc.spots,sc.active FROM scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid WHERE sc.datetime >= ' + rmysql.escape(req.body.start) + ' AND sc.datetime < ' + rmysql.escape(req.body.end) + ' AND gu.token = ' + rmysql.escape(req.header('token')))
    rmysql.query('SELECT sc.id AS sid,sc.classid as cid,sc.datetime,sc.price,sc.spots,sc.active FROM scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid WHERE sc.datetime >= ' + rmysql.escape(req.body.start) + ' AND sc.datetime < ' + rmysql.escape(req.body.end) + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.length < 1) {
        res.send(result);
        //res.end('{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
      }
    });
  });


  app.post('/api/getSCID/', function(req, res){
    try {
      check(req.header('token')).notNull();
      check(req.body.classid).isNumeric();
      //check(req.body.start).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
      //check(req.body.end).regex(/[0-9]{4}-[0-9]{1,2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9][0-9]/i)
    } catch (e) {
      res.end('{"status": "failed", "message":"' + e.message + '"}');
      return;
    }
    rmysql.query('SELECT sc.id FROM scheduledClass sc INNER JOIN gymUsers gu ON sc.gymid = gu.gymid WHERE classid = ' + req.body.classid + ' AND datetime = ' + rmysql.escape(req.body.datetime) + ' AND gu.token = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
      if(err || result.length < 1) {
        res.end('{"status": "failed", "message": "unable to retreive"}');
      } else {
        res.send(result);
      }
    });
  });
}