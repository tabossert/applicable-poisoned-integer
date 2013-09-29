//TODO
//Return distance for each matching


var config = require('config');
var elasticsearch = require('elasticsearch');
var dbConn = require('../lib/mysqlConn');
var rmysql = dbConn.rmysql;

var serverOptions = {
    host: config.elasticSearch.hosts,
    port: config.elasticSearch.port
};

var elasticSearch = new elasticsearch(serverOptions);

  var options = {
    _index : "search",
    _type : "class"
  };

function indexClass(classId,callback) {
  console.log('set')
  options._id = classId;

  var statement = [
        'SELECT c.id AS classId,c.name AS className,c.price,CONCAT(e.first_name, " ", e.last_name) AS instructor,p.lat,p.lon,p.name AS providerName,p.id AS providerId '
      , 'FROM classes c INNER JOIN providers p ON c.providerid = p.id INNER JOIN employees e ON c.instructor = e.id '
      , 'WHERE c.id = ' + classId
  ].join(" ");

  rmysql.query(statement, function(err, result, fields){
    if(err) {
      callback('no result', null);
      return;
    } else {
      var location = {};
      location.lat = result[0].lat;
      location.lon = result[0].lon;
      result[0].location = location;
      console.log(result)
      elasticSearch.index(options, result[0], function(err, obj) {
        if(err) {
          console.log(err);
          callback('unable to add document to index: ' + err,null);
          return;
        } else {
          callback(null, obj);
          return;
        }
      });
    }
  });
}


function getClass(classId, callback) {
  options._id = classId;
  
  elasticSearch.get(options, function(err, data) {
    if(err) {
      indexClass(classId, function(err, data) {
        if(err) {
          callback('unable to retrieve indexed class: ' + err,null);
          return;
        } else {
          getClass(classId,function(err, data) {
            callback(null, data._source);
            return;
          });
        }
      });
    } else {
      callback(null, data._source);
      return;
    }
  });  

}


function deleteClass(classId, callback) {
  options._id = classId;

  elasticSearch.delete(options, function(err, data) {
    if(err) {
      callback('unable to delete indexed class: ' + err,null);
      return;
    } else {
      callback(null, data);
      return;
    }
  });

}


function search(keyword,distance,lat,lon,callback) {

  if(keyword) {
    var querySet = { filtered : { query : { multi_match : { query : keyword, fields : [ 'className', 'providerName', 'instructor' ] } } } };
  } else {
    var querySet = { match_all : {} };
  }
  console.log(querySet)
  elasticSearch.search(options,{
    query: querySet,
    filter : {
      geo_distance : {
        distance :  distance + 'mi',
        location : { lat : lat, lon : lon }
      }
    }
  }, function (err, data) {
    if(err) {
      callback('unable to search index: ' + err,null);
      return;
    } else {
      callback(null,data.hits);
      return;
    }
  });
}


module.exports = {
  indexClass: indexClass,
  getClass: getClass,
  deleteClass: deleteClass,
  search: search
}