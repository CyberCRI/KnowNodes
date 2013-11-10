###
* This is the routing for the users. It calls /modules/user.js for implementing its actions.
###
userModule = require('../../modules/user')
baseController = require('../baseController')
user = new userModule

module.exports =
	options:
		before: 
			index: [baseController.isAdmin],
			destroy: [baseController.isAdmin]

	index: (request, response) ->
		cb = baseController.callBack response
		user.getAllUsers cb

	show: (request, response) ->
		cb = baseController.callBack response
		id = request.params.user.replace /:/g, ''
		user.getUserByNodeId id, cb

	create: (request, response) ->
		cb = baseController.callBack response
		user.saveNewUser request.body, cb

	destroy: (request, response) ->
		cb = baseController.callBack response
		id = request.params.user.replace /:/g, ''
		user.deleteUser id, cb

	getByEmail: (request, response) ->
		cb = baseController.callBack response
		email = request.params.user.replace /:/g, ''
		user.getUserByEmail email, cb

	getByKnownodeId: (request, response) ->
		cb = baseController.callBack response
		knownodeId = request.params.user.replace /:/g, ''
		user.getUserByKnownodeId knownodeId, cb