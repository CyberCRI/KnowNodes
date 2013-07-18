Callback = require('../Callback')
WikiController = require('./WikiController')

module.exports =

  create: (request, response) ->
    new WikiController(request).create(Callback.bind(response))

  findByTitle: (request, response) ->
    new WikiController(request).findByTitle(Callback.bind(response))