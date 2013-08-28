//TODO
//Create class memcache functions
// -- class object should contain class info and matching scheduled ids

var config = require('config');
var Memcached = require('memcached');

var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;
var memcached = new Memcached(config.Memcached.host);

function remMemKey(key) {
  console.log('remove');
  memcached.del(token, function (err) {
  });
}

function setMemAuth(token,callback) {
  console.log('set');
  rmysql.query('SELECT id,gymid,groupid FROM gymUsers WHERE token = ' + rmysql.escape(token), function(err, result, fields){
    console.log(result.length);
    if(result.length < 1) {
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

function setMemScheduledClass(sclassid,callback) {
  console.log('setMemClass');
  rmysql.query('SELECT sc.id,c.service,sc.classid,sc.datetime,sc.active,sc.price,sc.gymid,sc.spots FROM scheduledClass sc INNER JOIN classes c ON sc.classid = c.id WHERE sc.id = ' + sclassid, function(err, result, fields){
    if(err || result.length < 1) {
      callback('no result', null);
    } else {
      var scObj = {};
      scObj.classInfo = result[0];

      rmysql.query('SELECT s.userid,s.checkin FROM schedule s WHERE s.sclassid = ' + sclassid, function(err, pResult, fields){

        scObj.participants = pResult;

        memcached.set('sc' + sclassid, scObj, 1800, function (err) {
          if(err) {
            callback(null,result[0]);
          }
          callback(null,result[0]);
        });
      });
    }     
  });    
}


function isMemScheduledClass(sclassid,callback) {
  console.log('get');
  memcached.get('sc' + sclassid, function (err, data) {
    if(data == false) {
      setMemScheduledClass(sclassid, function(err,data) {
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
  remMemKey: remMemKey
};