###
* This is the routing for the comments on edges / knownodes
###
commentModule = require('../../modules/comment')
baseController = require('../baseController')

module.exports =
	options:
		before:
			index: [baseController.isAdmin()],
			destroy: [baseController.isAdmin]

	index: (request, response) ->
		cb = baseController.callBack response
		commentModule.getAllComments request.params.knownode, cb

	create: (request, response) ->
		cb = baseController.callBack response
		commentModule.createNewComment request.body.comment, request.body.originalObject.id, cb