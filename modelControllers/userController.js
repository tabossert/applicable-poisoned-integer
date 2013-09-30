
var userModel = require('../models/userModel');

function createUser(params,callback) {
  var user = new userModel.User({
  		email: params.email,
  		first_name: params.first_name,
  		last_name: params.last_name,
  		address: params.address,
  		city: params.city,
  		state: params.state,
  		zipcode: params.zipcode,
  		phone: params.phone,
  		sex: params.sex,
  		balance: 0.00,
  		status: 1
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

function readUser(params,callback) {
	var user = new userModel.User();
  user.find('all', {where: "id = " + params.id}, function(err, rows, fields) {
  	if(err) {
    	console.log(err);
    	callback(err, null);
    	return;
    }
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
	updateUser: updateUser
}