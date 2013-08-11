var config = require('config');
var _mysql = require('mysql');

var wmysql = _mysql.createConnection({
    host: config.WDatabase.WHOST,
    port: config.WDatabase.WPORT,
    user: config.WDatabase.WMYSQL_USER,
    password: config.WDatabase.WMYSQL_PASS
});

var rmysql = _mysql.createConnection({
    host: config.RDatabase.RHOST,
    port: config.RDatabase.RPORT,
    user: config.RDatabase.RMYSQL_USER,
    password: config.RDatabase.RMYSQL_PASS
});

var amysql = _mysql.createConnection({
    host: config.ADatabase.AHOST,
    port: config.ADatabase.APORT,
    user: config.ADatabase.AMYSQL_USER,
    password: config.ADatabase.AMYSQL_PASS
});


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
  return;
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
      return; 
}
try {
  amysql.connect(function(err) {
    if(err) {
      throw new Error('Unable to Connect to SQL Analytics');
    } else {
      console.log("Connected to SQL Slave");
    }
  });
} catch (e) {
      throw new Error('Unable to Connect to SQL Analytics');
      return; 
}

wmysql.query('use ' + config.WDatabase.WDATABASE);
rmysql.query('use ' + config.RDatabase.RDATABASE);
amysql.query('use ' + config.ADatabase.ADATABASE);

setInterval(keepAlive, 60000);
function keepAlive() {
    wmysql.query('SELECT 1');
    rmysql.query('SELECT 1');
    amysql.query('SELECT 1');
    console.log("Fired Keep-Alive");
    return;
}


module.exports = {
  rmysql: rmysql,
  wmysql: wmysql,
  amysql: amysql,
}