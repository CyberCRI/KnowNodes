baseController = require('../baseController')
resourceDAO = require('../../dao/resourceDAO')

module.exports =

  create: (request, response) ->
    dao = new resourceDAO request.user
    cb = baseController.callBack response
    dao.create(request.body, cb)

  show: (request, response) ->
    dao = new resourceDAO request.user
    cb = baseController.callBack response
    id = request.params.resource
    dao.read(id, cb)

  update: (request, response) ->
    dao = new resourceDAO request.user
    cb = baseController.callBack response
    id = request.params.resource
    dao.update(id, request.body, cb)

  destroy: (request, response) ->
    dao = new resourceDAO request.user
    cb = baseController.callBack response
    id = request.params.resource
    dao.delete(id, cb)