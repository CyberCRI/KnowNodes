###
* This is the routing for the users. It calls /modules/user.js for implementing its actions.
###
knownodeFileModule = require('../../modules/knownodeFiles')
baseController = require('../baseController')

module.exports =
	show: (request, response) ->
		cb = baseController.callBack response
		id = request.params.files.replace /:/g, ''
		fileModule = new knownodeFileModule request.user
		fileModule.getFile id, (err, store) ->
			if err?
				response.json error: err
			else
				#response.setHeader 'Content-Type', store.contentType
				#response.setHeader 'Content-disposition', 'attachment; filename=' + store.filename
				response.writeHead 200,
					'Content-Type': store.contentType,
					'Content-Length': store.length,
					'Content-disposition': 'attachment; filename=' + store.filename

				fileStream = store.stream(false)
				fileStream.pipe response,
					end:false

				fileStream.on "end", () ->
					fileStream.end()

	create: (request, response) ->
		cb = baseController.callBack response
		fileModule = new knownodeFileModule request.user
		fileModule.saveFile request.files, request.param, cb