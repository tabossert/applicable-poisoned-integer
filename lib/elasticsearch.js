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
    _type : "provider"
  };

function indexProvider(providerId,callback) {
  console.log('set')
  options._id = providerId;

  var statement = [
        'SELECT id AS providerId,name,address,city,state,zipcode,phone,contact,'
      , 'email,image,facebook,twitter,googleplus,url,lat,lon '
      , 'FROM providers WHERE id = ' + providerId
  ].join(" ");

  var statement2 = [
        'SELECT h.mondayOpen,h.mondayClose,h.tuesdayOpen,h.tuesdayClose,h.wednesdayOpen,h.wednesdayClose,h.thursdayOpen,'
      , 'h.thursdayOpen,h.thursdayClose,h.fridayOpen,h.fridayClose,h.saturdayOpen,h.saturdayClose,h.sundayOpen,h.sundayClose '
      , 'FROM hours h WHERE h.providerid = ' + providerId  
  ].join(" ");

  var statement3 = [
        'SELECT DISTINCT(c.name) FROM classes c '
      , 'INNER JOIN scheduledClass sc ON c.id = sc.classid '
      , 'WHERE c.providerid = ' + providerId + ' and sc.datetime > "2013-01-01 11:45:00"'
  ].join(" ");

  var statement4 = [
        'SELECT id,name,price FROM classes '
      , 'WHERE providerid = ' + providerId
  ].join(" ");

  rmysql.query(statement, function(err, result, fields){
    if(err) {
      callback('no result', null);
      return;
    } else {
      rmysql.query(statement2,function(err, result2, fields){      
        rmysql.query(statement3,  function(err, result3, fields){
          rmysql.query(statement4,  function(err, result4, fields){
            var keywords = [];
            result3.forEach(function(serv) {
              keywords.push(serv.service);
            });

            result[0].keywords = keywords;
            result[0].location = { "lat" : result[0].lat, "lon" : result[0].lon };
            result[0].hours = result2;
            result[0].classes = result4;
            var combRes = JSON.stringify(result[0]);

            elasticSearch.index(options, combRes, function(err, obj) {
              if(err) {
                console.log(err);
                callback('unable to add document to index: ' + err,null);
                return;
              } else {
                callback(null, obj);
                return;
              }
            });
          });
        });
      });
    }
  });
}


function getProvider(providerId, callback) {
  options._id = providerId;
  
  elasticSearch.get(options, function(err, data) {
    if(err) {
      indexProvider(providerId, function(err, data) {
        if(err) {
          callback('unable to retrieve indexed provider: ' + err,null);
          return;
        } else {
          getProvider(providerId,function(err, data) {
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


function deleteProvider(providerId, callback) {
  options._id = providerId;

  elasticSearch.delete(options, function(err, data) {
    if(err) {
      callback('unable to delete indexed provider: ' + err,null);
      return;
    } else {
      callback(null, data);
      return;
    }
  });

}


function search(keywords,distance,lat,lon,callback) {

  if(keywords) {
    var querySet = { filtered: { filter: { terms : { keywords: keywords } } } };
  } else {
    var querySet = { match_all : {} };
  }

  elasticSearch.search(options,{
    query: querySet,
    filter : {
      geo_distance : {
        distance :  distance + 'mi',
        location : { "lat" : lat, "lon" : lon }
      }
    }
  }, function (err, data) {
    if(err) {
      callback('unable to search index: ' + err,null);
      return;
    } else {
      callback(null,data._source);
      return;
    }
  });
}


module.exports = {
  indexProvider: indexProvider,
  getProvider: getProvider,
  deleteProvider: deleteProvider,
  search: search
}