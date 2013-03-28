knownodeModule = require('../../modules/knownode')
relationModule = require('../../modules/relation')
baseController = require('../baseController')
commentModule = require('../../modules/comment')
edgeModule = require('../../modules/edge')

module.exports =

  show: (request, response) ->
    cb = baseController.callBack response
    modEdge = new edgeModule request.user
    id = request.params.edge.replace /:/g, ''
    modEdge.getRelatedNodesToEdgeId id, cb
