baseController = require('../baseController')
connectionDAO = require('../../dao/connectionDAO')

module.exports =

  show: (request, response) ->
    dao = new connectionDAO request.user
    cb = baseController.callBack response
    id = request.params.connection
    dao.read(id, cb)

  create: (request, response) ->
    dao = new connectionDAO request.user
    cb = baseController.callBack response
    dao.create(request.body, cb)

  update: (request, response) ->
    dao = new connectionDAO request.user
    cb = baseController.callBack response
    id = request.params.connection
    dao.update(id, request.body, cb)

  destroy: (request, response) ->
    dao = new connectionDAO request.user
    cb = baseController.callBack response
    id = request.params.connection
    dao.delete(id, cb)