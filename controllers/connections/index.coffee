ConnectionController = require('./ConnectionController')
Callback = require('../Callback')

module.exports =

  create: (request, response) ->
    new ConnectionController(request).create(Callback.bind(response))

  show: (request, response) ->
    new ConnectionController(request).show(Callback.bind(response))

  update: (request, response) ->
    new ConnectionController(request).update(Callback.bind(response))

  destroy: (request, response) ->
    new ConnectionController(request).destroy(Callback.bind(response))

  voteUpConnection: (request, response) ->
    new ConnectionController(request).voteUpConnection(Callback.bind(response))
