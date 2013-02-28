###
* This is the routing for the concept posts.
###
conceptModule = require('../../modules/concept')
baseController = require('../baseController')
knownodeModule = require('../../modules/knownode')
commentModule = require('../../modules/comment')

module.exports =
	options:
		before:
			create: [baseController.isAdmin],
			destroy: [baseController.isAdmin]

	index: (request, response) ->
		cb = baseController.callBack response
		# baseController.logActivity request.user, 'title', 'description'
		concept = new conceptModule request.user
		concept.getAllConcepts cb

	show: (request, response) ->
		concept = new conceptModule request.user
		cb = baseController.callBack response
		id = request.params.concept.replace /:/g, ''
		concept.getConceptByKnownodeId id, cb

	create: (request, response) ->
		concept = new conceptModule request.user
		cb = baseController.callBack response
		concept.createNewConcept request.body.concept, cb

	destroy: (request, response) ->
		concept = new conceptModule request.user
		cb = baseController.callBack response
		id = request.params.concept.replace /:/g, ''
		concept.deleteConcept id, cb

	getRelatedKnownodes: (request, response) ->
		cb = baseController.callBack response
		modKnownode = new knownodeModule request.user
		id = request.params.concept.replace /:/g, ''
		modKnownode.getRelatedKnownodesToKnowNodeId id, cb

	getRelatedComments: (request, response) ->
		cb = baseController.callBack response
		comment = new commentModule request.user
		id = request.params.concept.replace /:/g, ''
		comment.getAllComments id, cb