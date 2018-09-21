var moment = require('moment');

var path = require('path');

var templatesDir = path.join(__dirname, '../templates');
var emailTemplates = require('email-templates');

var ROOT_URL = process.env.ROOT_URL;

var ACCEPTANCE_TEMPLATE = process.env.ACCEPTANCE_TEMPLATE;
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var HACKATHON_NAME = process.env.HACKATHON_NAME;
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
var TWITTER_HANDLE = process.env.TWITTER_HANDLE;
var FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE;

var SMTP_CLIENT_ID = process.env.SMTP_CLIENT_ID;
var SMTP_CLIENT_SECRET = process.env.SMTP_CLIENT_SECRET;
var SMTP_CLIENT_REFRESH = process.env.SMTP_CLIENT_REFRESH;

var ACCEPTANCE_EMAIL_TEMPLATE = process.env.ACCEPTANCE_TEMPLATE;
var VERIFICATION_EMAIL_TEMPLATE = process.env.VERIFICATION_EMAIL_TEMPLATE;
var PASSWORD_RESET_EMAIL_TEMPLATE = process.env.PASSWORD_RESET_EMAIL_TEMPLATE;
var PASSWORD_CHANGED_EMAIL_TEMPLATE = process.env.PASSWORD_CHANGED_EMAIL_TEMPLATE;
var WAIVER_EMAIL_TEMPLATE = process.env.WAIVER_EMAIL_TEMPLATE;

var EMAIL_CONTACT = process.env.EMAIL_CONTACT;
/*var EMAIL_HEADER_IMAGE = ';
if(EMAIL_HEADER_IMAGE.indexOf("https") == -1){
  EMAIL_HEADER_IMAGE = ROOT_URL + EMAIL_HEADER_IMAGE;
}
*/
var NODE_ENV = process.env.NODE_ENV;



const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

var controller = {};

function sendOne(template, emails, templateData, callback) {
  var msg = 
  {
    to: emails,
    from: EMAIL_ADDRESS,
    templateId: template,
    dynamic_template_data: templateData
  };
  sgMail.send(msg, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (info) {
      console.log(data);
    }
    if (callback) {
      callback(err, data);
    }
  });
}

/**
 * Send a verification email to a user, with a verification token to enter.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
controller.sendVerificationEmail = function (email, token, callback) {
  var verifyUrlData =
  {
    'url': ROOT_URL + '/verify/' + token
  };
  sendOne(VERIFICATION_EMAIL_TEMPLATE, email, verifyUrlData, callback);
};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordResetEmail = function (email, token, callback) {
  var resetUrlData =
  {
    'url': ROOT_URL + '/reset/' + token
  }
  sendOne(PASSWORD_RESET_EMAIL_TEMPLATE, email, resetUrlData, callback);
};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordChangedEmail = function (email, callback) {
  sendOne(PASSWORD_CHANGED_EMAIL_TEMPLATE, email, null, callback);
};

/**
 * Send the acceptance email to the participant.
 * @param  {[type]}   email     [description]
 * @param  {[type]}   confirmBy [description]
 * @param  {Function} callback  [description]
 */
controller.sendAcceptanceEmail = function (email, confirmBy, callback) {
  confirmDate = 
  { 
    'date': moment(confirmBy).format('MMMM D, YYYY h:mm A') 
  };
  sendOne(ACCEPTANCE_EMAIL_TEMPLATE, email, confirmDate, callback);
};

/**
 * Send the waiver email to the participant.
 * @param  {[type]}   email     [description]
 * @param  {Function} callback  [description]
 */
controller.sendWaiverEmail = function (email, callback) {

  var userEmailData =
  {
    'email': email
  };
  sendOne(WAIVER_EMAIL_TEMPLATE, email, userEmailData, callback);

};

module.exports = controller;