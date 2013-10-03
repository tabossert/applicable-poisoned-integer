/**
 *  Routes related to funding events
 */

var config = require('config')
  , moment = require('moment')
  , stripe = require('stripe')(stripeKey)
  , check = require('validator').check
  , sanitize = require('validator').sanitize;

// API config settings
var stripeKey = config.Stripe.stripeKey;

module.exports = function(app) {

  app.post('/api/funds/', function(req, res) {
    try {
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

  app.put('/api/funds/', function(req, res) {
    try {
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


  //THIS WILL BE USED TO CREATE A CHARGE USING THE CUSTOMER TOKEN
  app.post('/api/funds/charge',function(req, res) {
    try {
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
  });

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
}