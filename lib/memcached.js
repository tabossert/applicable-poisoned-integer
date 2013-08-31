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
      'SELECT id,gymid,groupid '
    , 'FROM gymUsers WHERE token = ' + rmysql.escape(token)
  ].join(" ");

  console.log(statement)
  rmysql.query(statement, function(err, result, fields){
    if(!result) {
      callback('no result', null)
    } else {
      memcached.set(token, result[0], 900, function (err) {
        if(err) {
          callback(null,result[0]);
        }
        callback(null,result[0]);
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
        }
        callback(null,data);
      });
    } else {
      console.log(data);
      callback(null,data);
    }
  });    
}


function setMemClass(classId, callback) {
  console.log('set');

  statement = [
      'SELECT c.id,c.gymid,c.service,c.price,c.active,c.daypass,c.spots,c.featured,c.duration,c.instructor,c.image,c.desc '
    , 'FROM classes c WHERE id = ' + classId
  ].join(" ");

  statement2 = [
      'SELECT sc.id FROM scheduledClass sc '
    , 'WHERE sc.datetime > NOW() AND sc.classid = ' + classId + ' '
    , 'ORDER BY sc.datetime'
  ].join(" ");

  rmysql.query(statement, function(err, result, fields){
    if(err || !result) {
      callback('no result', null);
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
          }
          callback(null,classObj);
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
        }
        callback(null,data);
      });
    } else {
      console.log(data);
      callback(null,data);
    }
  });
}


function setMemScheduledClass(sclassId,callback) {
  console.log('setMemClass');

  statement = [
      'SELECT sc.id,sc.service,sc.classid,sc.datetime,sc.active,sc.price,sc.gymid,sc.spots '
    , 'FROM scheduledClass sc WHERE sc.id = ' + sclassId
  ].join(" ");

  statement2 = [
      'SELECT s.id,s.userid,s.checkin,u.first_name,u.last_name '
    , 'FROM schedule s INNER JOIN users u ON s.userid = u.id '
    , 'WHERE s.sclassid = ' + sclassId
  ].join(" ");

  rmysql.query(statement, function(err, result, fields){
    if(err || result.length < 1) {
      callback('no result', null);
    } else {
      var scObj = {};
      scObj.classInfo = result[0];

      rmysql.query(statement2, function(err, pResult, fields){

        scObj.participants = pResult;

        memcached.set('sc' + sclassId, scObj, 1800, function (err) {
          if(err) {
            callback(null,scObj);
          }
          callback(null,scObj);
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
          callback(err,null)
        }
        callback(null,data);
      });
    } else {
      console.log(data);
      callback(null,data);
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