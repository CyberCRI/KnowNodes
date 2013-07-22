Callback = require('../Callback')
AdminController = require('./AdminController')

module.exports =

  reindexAllResources: (request, response) ->
    new AdminController(request).reindexAllResources(Callback.bind(response))