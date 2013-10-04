//TODO

var config = require('config');
var Memcached = require('memcached');

var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;
var userModel = require('../modelControllers/userController');
var memcached = new Memcached(config.Memcached.host);


function remMemKey(key) {
  console.log('remove');
  memcached.del(key, function (err) {
  });
}

function setMemAuth(token,callback) {
  console.log('set');

  statement = [
      'SELECT id,providerid,groupid '
    , 'FROM employees WHERE token = ' + rmysql.escape(token)
  ].join(" ");

  rmysql.query(statement, function(err, result, fields){
    if(!result[0]) {
      callback('no result', null)
      return;
    } else {
      memcached.set(token, result[0], 900, function (err) {
        if(err) {
          callback(null,result[0]);
          return;
        } else {
          callback(null,result[0]);
          return;
        }
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
          callback(err,null);
          return;
        } else {
          callback(null,data);
          return;
        }
      });
    } else {
      console.log(data);
      callback(null,data);
      return;
    }
  });    
}


function remMemToken(key) {
    console.log('remove');
    memcached.del(key, function (err) {
    });
}

function setMemToken(obj,callback) {
    userModel.readUser(obj,'email',function(err, data) {
      if(data.length < 1) {
        callback('no result',null);
        return;
      }

      if(data[0].status == 0) {
        console.log(data[0])
        callback('account disabled',null);
        return;
      }

      require('crypto').randomBytes(48, function(ex, buf) {
        if(!obj.token) {
          var token = data[0].id + buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
        } else {
          var token = obj.token;
        }
        data[0].token = token;

        memcached.set(token, data[0], 3600, function (err) {
          if(err) {
            callback(err,null);
            return;
          }

          callback(null,data[0]);
          return;
        });
      });
    });
}

function isMemToken(token,callback) {
    console.log('get');
    memcached.get(token, function (err, data) {
      console.log(data)
        if(data == false) {
            console.log(err);
            setMemAuth(token, function(err,data) {
                if(err) {
                    callback(err,null);
                    return;
                } else {
                    callback(null,data);
                    return;
                }
            });
        } else {
            callback(null,data);
            return;
        }
    });
}


function setMemClass(classId, callback) {
  console.log('set');

  statement = [
      'SELECT c.id,c.providerid,c.name,c.price,c.active,c.daypass,c.spots,c.featured,c.duration,c.instructor,c.image,c.desc '
    , 'FROM classes c WHERE c.id = ' + classId
  ].join(" ");

  statement2 = [
      'SELECT sc.id FROM scheduledClass sc '
    , 'WHERE sc.datetime > NOW() AND sc.classid = ' + classId + ' '
    , 'ORDER BY sc.datetime'
  ].join(" ");

  rmysql.query(statement, function(err, result, fields){
    if(!result || result.length <= 0) {
      callback('no result', null);
      return;
    } else {
      var classObj = {};
      classObj.classInfo = result[0];

      rmysql.query(statement2, function(err, scResult, fields){
        var scArray = [];
        scResult.forEach(function(scClass) {
           scArray.push(scClass);
        });
        classObj.scheduledClasses = scArray;

        memcached.set('c' + classId, classObj, 1800, function (err) {
          if(err) {
            callback(null,classObj);
            return;
          } else {
            callback(null,classObj);
            return;
          }
        });
      });
    }
  });
}


function isMemClass(classId,callback) {
  console.log('get');
  memcached.get('c' + classId, function (err, data) {
    if(data == false) {
      setMemClass(classId, function(err,data) {
        if(err) {
          callback(err,null)
          return;
        } else {
          callback(null,data);
          return;
        }
      });
    } else {
      console.log(data);
      callback(null,data);
      return;
    }
  });
}


function setMemScheduledClass(sclassId,callback) {
  console.log('setMemClass');

  statement = [
      'SELECT sc.id,sc.name,sc.classid,sc.datetime,sc.active,sc.price,sc.providerid,sc.spots '
    , 'FROM scheduledClass sc WHERE sc.id = ' + sclassId
  ].join(" ");

  statement2 = [
      'SELECT s.id,s.userid,s.checkin,u.first_name,u.last_name '
    , 'FROM schedule s INNER JOIN users u ON s.userid = u.id '
    , 'WHERE s.scheduledclassid = ' + sclassId
  ].join(" ");

  statement3 = [
      'SELECT COUNT(s.id) AS spotsReserved FROM schedule s INNER JOIN scheduledClass sc '
    , 'ON sc.id = s.scheduledclassid WHERE sc.id = ' + sclassId
  ].join(" ");

  rmysql.query(statement, function(err, result, fields){
    if(!result || result.length <= 0) {
      callback('no result', null);
      return;
    } else {
      var scObj = {};
      scObj.classInfo = result[0];

      rmysql.query(statement2, function(err, pResult, fields){

        scObj.participants = pResult;

        rmysql.query(statement3, function(err, sResult, fields) {
          
          scObj.classInfo.spotsReserved = sResult[0].spotsReserved;

          memcached.set('sc' + sclassId, scObj, 1800, function (err) {
            if(err) {
              callback(null,scObj);
              return;
            } else {
              callback(null,scObj);
              return;
            }
          });
        });
      });
    }     
  });    
}


function isMemScheduledClass(sclassId,callback) {
  console.log('get');
  memcached.get('sc' + sclassId, function (err, data) {
    if(data == false) {
      setMemScheduledClass(sclassId, function(err,data) {
        if(err) {
          callback(err,null);
          return;
        } else {
          callback(null,data);
          return;
        }
      });
    } else {
      console.log(data);
      callback(null,data);
      return;
    }
  });    
}


module.exports = {
  isMemAuth: isMemAuth,
  setMemAuth: setMemAuth,
  isMemToken: isMemToken,
  setMemToken: setMemToken,
  isMemScheduledClass: isMemScheduledClass,
  setMemScheduledClass: setMemScheduledClass,
  isMemClass: isMemClass,
  setMemClass: setMemClass,
  remMemKey: remMemKey
};