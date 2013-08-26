
var config = require('config');
var elasticsearch = require('elasticsearch');
var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;

var serverOptions = {
    host: config.elasticSearch.hosts,
    port: config.elasticSearch.port,
};

var elasticSearch = new elasticsearch(serverOptions);


function indexProvider(pid,callback) {
  console.log('set')
  var options = {
    _index : "search",
    _type : "provider",
    _id : pid
  };

  var statement = [
        'SELECT id AS pid,name,address,city,state,zipcode,phone,contact,'
      , 'email,image,facebook,twitter,googleplus,url,lat,lon '
      , 'FROM gyms WHERE id = ' + pid
  ].join(" ");

  var statement2 = [
        'SELECT DISTINCT(c.service) FROM classes c '
      , 'INNER JOIN scheduledClass sc ON c.id = sc.classid '
      , 'WHERE c.gymid = ' + pid + ' and sc.datetime > "2013-01-01 11:45:00"'
  ].join(" ");

  var statement3 = [
        'SELECT id,service,price FROM classes '
      , 'WHERE gymid = ' + pid
  ].join(" ");

  rmysql.query(statement, function(err, result, fields){
    if(err) {
      callback('no result', null)
    } else {
      rmysql.query(statement2,function(err, result2, fields){      
        rmysql.query(statement3,  function(err, result3, fields){
          var keywords = [];
          result2.forEach(function(serv) {
            keywords.push(serv.service);
          });

          result[0].keywords = keywords;
          result[0].location = { "lat" : result[0].lat, "lon" : result[0].lon }
          result[0].classes = result3;
          var combRes = JSON.stringify(result[0])

          elasticSearch.index(options, combRes, function(err, obj) {
            if(err) {
              console.log(err)
              callback('unable to add document to index: ' + err,null)
            } else {
              callback(null, obj);
            }
          });
        });
      });
    }
  });
}

function search(keywords,distance,lat,lon,callback) {

  var options = {
    _index : "search",
    _type : "provider"
  };

  if(keywords) {
    var querySet = { keywords : keywords};
  } else {
    var querySet = { "match_all" : {} };
  }

  elasticSearch.search(options,{
    query: {
      filtered: {
        filter: {
          terms : {
            keywords: keywords
          }
        }
      }
    },
    filter : {
      geo_distance : {
        distance :  distance + 'mi',
        location : { "lat" : lat, "lon" : lon }
      }
    }
  }, function (err, data) {
    if(err) {
      console.log
      callback('unable to search index: ' + err,null)
    } else {
      callback(null,data)
    }
  });
}


module.exports = {
  indexProvider: indexProvider,
  search: search,
}