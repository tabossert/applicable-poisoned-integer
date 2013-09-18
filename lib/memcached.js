//TODO

var config = require('config');
var Memcached = require('memcached');

var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;
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
    , 'WHERE s.sclassid = ' + sclassId
  ].join(" ");

  statement3 = [
      'SELECT sc.spots - COUNT(s.id) AS spotsReserved FROM schedule s INNER JOIN scheduledClass sc ' 
    , 'ON sc.id = s.sclassid WHERE sc.id = ' + sclassId
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
  isMemScheduledClass: isMemScheduledClass,
  setMemScheduledClass: setMemScheduledClass,
  isMemClass: isMemClass,
  setMemClass: setMemClass,
  remMemKey: remMemKey
};