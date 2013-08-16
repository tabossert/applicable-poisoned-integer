//Next Steps
// - Add employee id into memcache value
// - Modify routes to use gymid or eid instead ok token


var config = require('config');
var Memcached = require('memcached');

var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;
var memcached = new Memcached(config.Memcached.host);

function remMemAuth(token) {
  console.log('remove');
  memcached.del(token, function (err) {
  });
}

function setMemAuth(token,callback) {
  console.log('set');
  rmysql.query('SELECT id,gymid FROM gymUsers WHERE token = ' + rmysql.escape(token), function(err, result, fields){
    console.log(result.length)
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
          callback(err,null)
        }
        callback(null,data);
      });
    } else {
      console.log(data)
      callback(null,data);
    }
  });    
}


module.exports = {
  isMemAuth: isMemAuth,
  setMemAuth: setMemAuth,
  remMemAuth: remMemAuth,
}