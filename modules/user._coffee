# Serve JSON to the AngularJS client by sending a request
# handles requests for the user

BaseModule = require('./baseModule');

# general function to be used as a callback function for the return data from the DB
module.exports = class User extends BaseModule
	constructor: () ->
		super null

	formatUser: (usr) ->
		return null if not usr
		retVal =
			id: usr.id,
			KN_ID: usr.KN_ID,
			email: usr.email,
			firstName: usr.firstName,
			lastName: usr.lastName,
			gender: usr.gender,
			dateOfBirth: usr.dateOfBirth,
			displayName: usr.firstName + ' ' + usr.lastName
		return retVal

	getAllUsers: (_) ->
		userList = []
		@DB.User.all(limit: 10, _).forEach_ _, (_, currentUserObj) ->
			userList.push currentUserObj
		return userList

	getUserByNodeId: (id, _) =>
		usr = @DB.User.find id, _
		return @formatUser(usr)

	getUserByKnownodeId: (id, _) =>
		usr = @DB.User.findOne
			where:
				KN_ID: id
		, _
		return @formatUser(usr)

	getUserByEmail: (email, _) =>
		usr = @DB.User.findOne
			where:
				email: email
		, _
		return @formatUser(usr)

	saveNewUser: (userData, _) ->
		@DB.User.create userData, _

	deleteUser: (id, _) ->
		user = @DB.User.find id, _
		user.destroy _