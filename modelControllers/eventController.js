
var eventModel = require('../models/eventModel')
  , moment = require('moment');

function createEvent(params,callback) {
  var event = new eventModel.Event({
  		userid: params.userid,
  		providerid: params.providerid,
  		scheduledclassid: params.scheduledclassid,
  		price: params.price,
      datetime: params.datetime
  });

  var statement = [ 'CALL addEvent('
      , params.userid + ','
      , params.price + ','
      , params.scheduledclassid + ','
      , params.providerid + ','
      , params.datetime + ')'
  ].join(" ");
  console.log(statement)

  event.query(statement, function(err, result) {
  	if(err) {
  		console.log(err);
  		callback(err,null);
  		return;
  	}

    callback(null,result);
    return;
  });
}

function deleteEvent(scheduleid,callback) {
  var event = new eventModel.Event({});

  event.set('active', '0');

  event.save("id=" + scheduleid, function(err, result) {
  	if(err) {
  		callback(err,null);
  		return;
  	}
  	callback(null, result);
  	return;
  });
}


module.exports = {
	createEvent: createEvent,
	deleteEvent: deleteEvent
}