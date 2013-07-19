Callback = require('../Callback')
WikiController = require('./WikiController')

module.exports =

  # Returns existing Resource for this wikipedia article, or creates a new one if none exist
  create: (request, response) ->
    new WikiController(request).findOrCreate(Callback.bind(response))

  show: (request, response) ->
    new WikiController(request).findByTitle(Callback.bind(response))