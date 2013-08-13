/**
 *  Routes related to funding events
 */

var config = config = require('config')
  , moment = require('moment')
  , fs = require("fs")
  , path = require("path")
  , check = require('validator').check
  , sanitize = require('validator').sanitize;

// API config settings
var salt = config.Hash.salt;
var stripeKey = config.Stripe.stripeKey;
var stripe = require('stripe')(stripeKey);

//DB
var dbConn = require('../mysqlConn');
var rmysql = dbConn.rmysql;
var wmysql = dbConn.wmysql;
var amysql = dbConn.amysql;

module.exports = function(app) {
  
	app.post('/api/createCustomerToken/', function(req, res) {
	  try {
	    check(req.header('ltype')).isAlphanumeric();
	    check(req.header('token')).notNull();
	  } catch (e) {
	    res.end('{"status": "failed", "message":"' + e.message + '"}');
	    return;
	  }
	  stripe.customers.create({email: req.body.email, description: "Customer object for" + req.body.email, card: req.body.cToken}, function(err, customer) {
	   if(err) {
	    console.log(err.message);
	    res.end('{"status": "failed", "message": "error occured"}');
	    return;
	   } else {
	    wmysql.query('UPDATE balance b INNER JOIN users u ON b.userid = u.id SET b.cToken = "' + customer.id + '" WHERE u.`' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')), function(err, result, fields) {
	      if(err) {
	        res.end('{"status": "failed"}');
	      } else {
	        res.end('{"status": "success", "cToken": "' + customer.id + '"}');
	      }
	    });
	   }
	  });
	});


	app.put('/api/updateCustomerToken/', function(req, res) {
	  try {
	    check(req.header('ltype')).isAlphanumeric();
	    check(req.header('token')).notNull();
	  } catch (e) {
	    res.end('{"status": "failed", "message":"' + e.message + '"}');
	    return;
	  }
	  stripe.customers.update(req.body.cuToken,{email: req.body.email, description: "Customer object for" + req.body.email, card: req.body.cToken}, function(err, customer) {
	    if(err) {
	      console.log(err);
	      res.end('{"status": "failed", "message": "error occured"}');
	      return;
	    } else {
	      res.end('{"status": "success", "cToken": "' + customer.id + '"}');
	    }
	  });
	});



	app.post('/api/processPayment/',function(req, res) {
	  try {
	    check(req.header('ltype')).isAlphanumeric();
	    check(req.header('token')).notNull();
	  } catch (e) {
	    res.end('{"status": "failed", "message":"' + e.message + '"}');
	    return;
	  }
	  var amount = req.body.amount*100;
	  console.log(amount);
	  stripe.charges.create({amount: amount, currency: 'usd',customer: req.body.cToken},function(err, charge) {
	    if(err) {
	      console.log(err)
	      res.end('{"status": "failed", "message": "error occured"}');
	      return;
	    } else {
	      try {
	        paymentTransaction(req.header('ltype'),req.header('token'),charge.id, function(mes) {
	          res.end('{"status": "success"}');
	        });
	      } catch (e) {
	        console.log(e);
	      }
	    }
	  });
	})


	app.post('/api/retrieveCustomer/',function(req, res) {
	  try {
	    check(req.header('ltype')).isAlphanumeric();
	    check(req.header('token')).notNull();
	  } catch (e) {
	    res.end('{"status": "failed", "message":"' + e.message + '"}');
	    return;
	  }  
	  console.log(req.body);
	  //Use stripe here to get customer billing info and return it.
	  stripe.customers.retrieve(req.body.cToken, function(err, customer) {
	    if(err) {
	      console.log(err);
	      res.end('{"status": "failed", "unable to retrieve"}');
	      return;
	    } else {
	      res.end('[{"cuToken": "' + customer.id + '","name": "' + customer.active_card.name + '", "address_line1": "' + customer.active_card.address_line1 + '", "address_line2": "' + customer.active_card.address_line2 + '", "address_city": "' + customer.active_card.address_city + '", "address_state": "' + customer.active_card.address_state + '", "address_zip": "' + customer.active_card.address_zip + '", "ccard": "' + customer.active_card.last4 + '", "exp_month": "' + customer.active_card.exp_month + '", "exp_year": "' + customer.active_card.exp_year + '", "cvc": "' + customer.active_card.cvc_check + '" }]');
	    }
	  });
	})

	//app.post('/api/paymentTransaction/', function(req, res) {
	function paymentTransaction(ltype,token,refid,callback) {
	  rmysql.query('SELECT id AS uid FROM users WHERE `' + ltype + '_token` = ' + rmysql.escape(token), function(err, result, fields) {
	    if(err || result.length < 1) {
	      callback("no user matched");
	    } else {
	      var uid = result[0].uid;
	      stripe.charges.retrieve(refid, function(err,charge) {
	        console.log(charge);
	        if(err) {
	          console.log("Couldn't retrieve charge");
	        } else {
	          wmysql.query('INSERT INTO transactions (userid,refid,timestamp) VALUES (' + uid + ',' + wmysql.escape(refid) + ',NOW())', function(err, result, fields) {
	            if(err || result.affectedRows < 1) {
	              callback("unable to record transaction");
	              //res.end('{"status": "failed", "message": "unable to add transaction"}');
	            } else {
	              wmysql.query('UPDATE users SET balance = balance + ' + charge.amount/100 + ' WHERE id = ' + uid, function(err, result, fields) {
	                if(err || result.affectedRows < 1) {
	                  callback("unable to update balance");
	                  //res.end('{"status": "failed", "message": "unable to update balance"}');
	                } else {
	                  callback("success");
	                }
	              });  
	            }
	          });
	        }
	      });
	    }
	  });
	};


	app.post('/api/getTransactions/:offset', function(req, res) {
	  try {
	    check(req.header('ltype')).isAlphanumeric();
	    check(req.header('token')).notNull();
	    check(req.body.offset).isNumeric();
	  } catch (e) {
	    res.end('{"status": "failed", "message":"' + e.message + '"}');
	    return;
	  }
	  rmysql.query('SELECT refid FROM transactions t INNER JOIN users u WHERE u.`' + req.header('ltype') + '_token` = ' + rmysql.escape(req.header('token')) + ' ORDER BY timestamp DESC LIMIT 5 OFFSET ' + rmysql.escape(req.params.offset), function(err, result, fields) {
	    if(err || result.length < 1) {
	      res.end('{"status": "failed", "message": "unable to retreive"}');
	    } else {
	      res.send(result);
	    }
	  });
	});
}