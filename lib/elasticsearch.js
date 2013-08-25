//Next Steps
// - Add employee id into memcache value
// - Modify routes to use gymid or eid instead ok token


var config = require('config');
var elasticsearch = require('elasticsearch');
var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;

var serverOptions = {
    host: 'localhost',
    port: 9200,
};

var elasticSearch = new elasticsearch(serverOptions);

function indexProvider(pid,callback) {
  console.log('set');

  var options = {
    _index : "search",
    _type : "provider",
    _id : pid
  };

  rmysql.query('SELECT id AS pid,name,address,city,state,zipcode,phone,contact,email,image,facebook,twitter,googleplus,url FROM gyms WHERE id = ' + pid, function(err, result, fields){
    if(err) {
      callback('no result', null)
    } else {
      rmysql.query('SELECT id,service,price FROM classes WHERE gymid = ' + pid,  function(err, result2, fields){
        result[0].class = result2;
        result[0].items = ["spin class", "yoga"];
        var slap = { };
        slap.data = result;

        elasticSearch.index(options, slap, function(err, obj) {
          //console.log(obj)
          callback(null, obj);
        });
      });
    }
  });
}

function search(callback) {

  var options = {
    _index : "search",
    _type : "provider"
  };

  elasticSearch.search(options,{
    query : {
      terms : {
        items : ["yoga"]
      }
    }
  }, function (err, data) {
    callback(null,data)
  });
}


module.exports = {
  indexProvider: indexProvider,
  search: search,
}