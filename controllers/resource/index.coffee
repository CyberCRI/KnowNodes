baseController = require('../baseController')
resourceModule = require('../../modules/resource/resource')

module.exports =

  show: (request, response) ->
    module = new resourceModule request.user
    cb = baseController.callBack response
    id = request.params.resource
    module.show(id, cb)

  create: (request, response) ->
    module = new resourceModule request.user
    cb = baseController.callBack response
    console.log (request)
    module.create(request.body, cb)

  update: (request, response) ->
    module = new resourceModule request.user
    cb = baseController.callBack response
    id = request.params.resource
    module.update(id, request.body.resource, cb)

  delete: (request, response) ->
    module = new resourceModule request.user
    cb = baseController.callBack response
    id = request.params.resource
    module.delete(id, cb)