
var tokenErr = "token header is required";
var emailErr = "invalid email address";
var classIdErr = "invalid class id, positive integer required";
var providerIdErr = "invalid provider id, positive integer required";
var participantIdErr = "invalid participant id, positive integer required";
var priceErr = "invalid price, positive integer required";
var spotsErr = "invalid spots, positive integer required";
var activeErr = "invalid active, boolean value required";
var zipcodeErr = "invalid zipcode, 5 digit positive integer required";
var employeeIdErr = "invalid employee id, positive integer required";
var paymentTypeErr = "invalid payment type, positive integer required";
var typeErr = "invalid type, positive integer required";
var payLimitErr = "invalid payLimit, positive integer required";
var durationErr = "invalid duration, positive integer required";
var dayPassErr = "invalid dayPass, boolean value required"

module.exports = {
  tokenErr: tokenErr,
  emailErr: emailErr,
  classIdErr: classIdErr,
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