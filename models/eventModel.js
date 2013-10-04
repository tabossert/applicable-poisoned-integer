var config = require('config')
, mysqlModel = require('mysql-model');

var MyAppModel = mysqlModel.createConnection({
  host     : config.WDatabase.WHOST,
  user     : config.WDatabase.WMYSQL_USER,
  password : config.WDatabase.WMYSQL_PASS,
  database : config.WDatabase.WDATABASE
});

var Event = MyAppModel.extend({
    tableName: "schedule"
});


module.exports = {
	Event: Event
}