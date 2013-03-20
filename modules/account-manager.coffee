###
* User: Liad Magen
* Date: 05/02/13
* Time: 12:43
*
* this is a class for managing the logins of the users in the system
*
#####
userModule = require('./user')

module.exports = class Comment extends BaseModule
	constructor: (user) ->
		super null

	exports.autoLogin = (user, pass, callback) ->
		user - new userModule
		user.findOne(user:user, (e, o) ->
			if (o)
			     o.pass == if pass then callback o else callback null
			else
				callback null)

