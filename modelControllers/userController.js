
var userModel = require('../models/userModel')
  , moment = require('moment');

function createUser(params,callback) {
  var user = new userModel.User({
  		email: params.email,
  		first_name: params.givenName,
  		last_name: params.familyName,
  		balance: 0.00,
  		status: 1,
      created: moment().format('YYYY-MM-DD HH:mm:ss'),
      lastlogin: moment().format('YYYY-MM-DD HH:mm:ss')
  });

  user.save(function(err, result) { 
  	if(err) {
  		console.log(err);
  		callback(err,null);
  		return;
  	}

    callback(null,result);
    return;
  });
}

function readUser(params,where,callback) {
	var user = new userModel.User();
  user.find('all', {where: where + ' = "' + params[where] + '"'}, function(err, rows, fields) {
  	if(err) {
    	console.log(err);
    	callback(err, null);
    	return;
    }
    console.log(rows)
    callback(null,rows);
    return;
  });
}

function updateUser(params,callback) {
	var user = new userModel.User({});
	for(var k in params) {
		user.set(k, params[k]);
	}

  user.save("id=" + params.id, function(err, result) {
  	if(err) {
  		callback(err,null);
  		return;
  	}
  	callback(null, result);
  	return;
  });
}

function createRefill(params,callback) {
    var refill = new userModel.Refill({
        userid: params.userid,
        automatic: params.automatic,
        refillamount: params.refillamount,
        schedule: params.schedule,
        minamount: params.minamount
    });
    refill.save(function(err, result) {
        if(err) {
            console.log(err);
            callback(err,null);
            return;
        }
        callback(null,result);
        return;
    });
}

function readRefill(params,callback) {
    var refill = new userModel.Refill();
    refill.find('all', {where: "userid = " + params.id}, function(err, rows, fields) {
        if(err) {
            console.log(err);
            callback(err, null);
            return;
        }
        callback(null,rows);
        return;
    });
}

function updateRefill(params,callback) {
    var refill = new userModel.Refill({});
    for(var k in params) {
        refill.set(k, params[k]);
    }

    refill.save("userid=" + params.id, function(err, result) {
        if(err) {
            console.log(err);
            callback(err,null);
            return;
        }
        callback(null, result);
        return;
    });
}


module.exports = {
	createUser: createUser,
	readUser: readUser,
	updateUser: updateUser,
    createRefill: createRefill,
    readRefill: readRefill,
    updateRefill: updateRefill
}