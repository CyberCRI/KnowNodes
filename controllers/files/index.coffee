###
* This is the routing for the users. It calls /modules/user.js for implementing its actions.
###
knownodeFileModule = require('../../modules/knownodeFiles')
baseController = require('../baseController')

module.exports =
	show: (request, response) ->
		#cb = baseController.callBack response
		id = request.params.files.replace /:/g, ''
		fileModule = new knownodeFileModule request.user
		fileModule.sendFileToStreamHandler response, id

	create: (request, response) ->
		cb = baseController.callBack response
		fileModule = new knownodeFileModule request.user
		fileModule.saveFile request.files, request.param, cb

	destroy: (request, response) ->
		cb = baseController.callBack response
		fileModule = new knownodeFileModule request.user
		fileModule.deleteFile request.files, request.param, cb
