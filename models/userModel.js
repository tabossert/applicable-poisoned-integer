var config = require('config')
, mysqlModel = require('mysql-model');

var MyAppModel = mysqlModel.createConnection({
  host     : config.WDatabase.WHOST,
  user     : config.WDatabase.WMYSQL_USER,
  password : config.WDatabase.WMYSQL_PASS,
  database : config.WDatabase.WDATABASE,
});

var User = MyAppModel.extend({
    tableName: "users"
});

module.exports = {
	User: User
}