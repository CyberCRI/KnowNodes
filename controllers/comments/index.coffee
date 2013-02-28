###
* This is the routing for the comments on edges / knownodes
###
commentModule = require('../../modules/comment')
baseController = require('../baseController')

module.exports =
	options:
		before:
			create: [baseController.isLoggedIn],
			destroy: [baseController.isAdmin]

	show: (request, response) =>
		module.exports.getRelatedComments request, response

	create: (request, response) ->
		cb = baseController.callBack response
		comment = new commentModule request.user
		comment.createNewComment request.body.comment, request.body.originalObject.id, cb

	getRelatedComments: (request, response) ->
		cb = baseController.callBack response
		comment = new commentModule request.user
		commentsOfId = request.params.comment.replace /:/g, ''
		comment.getAllCommentsOfKnownodeID commentsOfId, cb