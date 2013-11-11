baseController = require('../baseController')
knownodeModule = require('../../modules/knownode')

module.exports =
  options:
    before:
      create: [baseController.isAdmin],
      destroy: [baseController.isAdmin]

  getRelatedKnownodes: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    id = request.params.concept.replace /:/g, ''
    modKnownode.getRelatedKnownodesToKnowNodeId id, cb