###
* This is the routing for the users. It calls /modules/user.js for implementing its actions.
###
knownodeFileModule = require('../../modules/knownodeFiles')
baseController = require('../baseController')

module.exports =
	show: (request, response) ->
		cb = baseController.callBack response
		id = request.params.user.replace /:/g, ''
		knownodeFileModule.getUserByNodeId id, cb

	create: (request, response) ->
		cb = baseController.callBack response
		knownodeFileModule.saveFile request.files, request.param, cb