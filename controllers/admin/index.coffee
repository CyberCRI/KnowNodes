Callback = require('../Callback')
AdminController = require('./AdminController')

module.exports =

  indexAllResources: (request, response) ->
    new AdminController(request).indexAllResources(Callback.bind(response))

  indexAllConnections: (request, response) ->
    new AdminController(request).indexAllConnections(Callback.bind(response))

  hashAllPasswords: (request, response) ->
    new AdminController(request).hashAllPasswords(Callback.bind(response))