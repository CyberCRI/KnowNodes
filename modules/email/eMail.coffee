emailTemplates = require('email-templates')
path           = require('path')
templatesDir   = path.resolve(__dirname, 'templates')
nodemailer     = require('nodemailer')
emailConf      = require('../../config/email.conf.js')

exports.sendTemplateEmailToUser = (chosenTemplate, emailSubject, user, callback) ->
	emailTemplates(templatesDir, (err, template) ->
	  return console.log(err) if (err)
		transport = nodemailer.createTransport "SMTP", emailConf.getEmailConfiguration
		template chosenTemplate, user, (err, html, text) ->
				return console.log err if err
				transport.sendMail
					from: 'Knownodes System <system@knownodes.com>',
					to: user.email,
					subject: emailSubject,
					html: html,
					# generateTextFromHTML: true,
					text: text,
					(err, responseStatus) ->
						if (err)
							console.log(err)
							return callback(err)
						else
							console.log responseStatus.message
							return callback null, responseStatus.message
	  )