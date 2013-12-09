Callback = require('../Callback')
UserController = require('./UserController')

module.exports =

  create: (request, response) ->
    new UserController(request).create(Callback.bind(response))

  show: (request, response) ->
    new UserController(request).show(Callback.bind(response))

  findByEmail: (request, response) ->
    new UserController(request).findByEmail(Callback.bind(response))

  karma: (request, response) ->
    new UserController(request).karma(Callback.bind(response))

  triplets: (request, response) ->
    new UserController(request).triplets(Callback.bind(response))

  aggregatedTriplets: (request, response) ->
    new UserController(request).aggregatedTriplets(Callback.bind(response))