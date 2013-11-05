knownodeModule = require('../../modules/knownode')
baseController = require('../baseController')

module.exports =

  show: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    id = request.params.knownode.replace /:/g, ''
    modKnownode.getKnownodeByKnownodeId id, cb