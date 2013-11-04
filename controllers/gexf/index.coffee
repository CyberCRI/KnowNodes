Callback = require('../Callback')
GexfController = require('./GexfController')

module.exports =

  exportTriplet: (request, response) ->
    new GexfController(request).exportTriplet(Callback.bind(response))

  exportUserTriplets: (request, response) ->
    new GexfController(request).exportUserTriplets(Callback.bind(response))

  exportResourceTriplets: (request, response) ->
    new GexfController(request).exportResourceTriplets(Callback.bind(response))