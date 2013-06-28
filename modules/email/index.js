var emailTemplates = require('email-templates')
    , path           = require('path')
    , templatesDir   = path.resolve(__dirname, 'templates')
    , nodemailer     = require('nodemailer')
    , emailConf      = require('../../config/email.conf.js');

exports.sendTemplateEmailToUser = function(chosenTemplate, emailSubject, user, callback) {
    emailTemplates(templatesDir, function(err, template) {
        if (err) {
            return console.log(err);
        } else {
            var transport = nodemailer.createTransport("SMTP", emailConf.getEmailConfiguration());
            return template(chosenTemplate, user, function(err, html, text) {
                if (err) {
                    console.log(err);
                } else {
                    transport.sendMail({
                        from: 'Knownodes System <system@knownodes.com>',
                        to: user.email,
                        subject: emailSubject,
                        html: html,
                        // generateTextFromHTML: true,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) {
                            console.log(err);
                            return callback(err);
                        } else {
                            console.log(responseStatus.message);
                            return callback(null, responseStatus.message);
                        }
                    });
                }
            });
        }
    });
};