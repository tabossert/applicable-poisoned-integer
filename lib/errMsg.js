
var tokenErr = "token header is required";
var emailErr = "invalid email address";
var classIdErr = "invalid class id, positive integer required";
var cancelFutureErr = "invalid cancelFuture value, boolean value required"
var providerIdErr = "invalid provider id, positive integer required";
var participantIdErr = "invalid participant id, positive integer required";
var checkinErr = "invalid checkin value, boolean value required";
var priceErr = "invalid price value, positive integer required";
var spotsErr = "invalid spots value, positive integer required";
var activeErr = "invalid active value, boolean value required";
var zipcodeErr = "invalid zipcode, 5 digit positive integer required";
var employeeIdErr = "invalid employee id, positive integer required";
var paymentTypeErr = "invalid payment type value, positive integer required";
var typeErr = "invalid type value, positive integer required";
var payLimitErr = "invalid payLimit value, positive integer required";
var durationErr = "invalid duration value, positive integer required";
var dayPassErr = "invalid dayPass value, boolean value required"

module.exports = {
  tokenErr: tokenErr,
  emailErr: emailErr,
  classIdErr: classIdErr,
  cancelFutureErr: cancelFutureErr,
  providerIdErr: providerIdErr,
  participantIdErr: participantIdErr,
  priceErr: priceErr,
  spotsErr: spotsErr,
  activeErr: activeErr,
  zipcodeErr: zipcodeErr,
  employeeIdErr: employeeIdErr,
  paymentTypeErr: paymentTypeErr,
  typeErr: typeErr,
  payLimitErr: payLimitErr
}