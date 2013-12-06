Callback = require('../Callback')
AdminController = require('./AdminController')

module.exports =

  indexAllResources: (request, response) ->
    new AdminController(request).indexAllResources(Callback.bind(response))

  indexAllConnections: (request, response) ->
    new AdminController(request).indexAllConnections(Callback.bind(response))

  indexAllUsers: (request, response) ->
    new AdminController(request).indexAllUsers(Callback.bind(response))
