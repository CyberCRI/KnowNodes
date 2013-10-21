Callback = require('../Callback')
ResourceController = require('./ResourceController')

module.exports =

  create: (request, response) ->
    new ResourceController(request).create(Callback.bind(response))

  show: (request, response) ->
    new ResourceController(request).show(Callback.bind(response))

  update: (request, response) ->
    new ResourceController(request).update(Callback.bind(response))

  searchByKeyword: (request, response) ->
    new ResourceController(request).searchByKeyword(Callback.bind(response))

  findByUrl: (request, response) ->
    new ResourceController(request).findByUrl(Callback.bind(response))

  triplets: (request, response) ->
    new ResourceController(request).findTripletsByResourceId(Callback.bind(response))