TripletController = require('./TripletController')
Callback = require('../Callback')

module.exports =

  latest: (request, response) ->
    new TripletController(request).latest(Callback.bind(response))

  hottest: (request, response) ->
    new TripletController(request).hottest(Callback.bind(response))

  aggregatedLatest: (request, response) ->
    new TripletController(request).aggregatedLatest(Callback.bind(response))

  aggregatedHottest: (request, response) ->
    new TripletController(request).aggregatedHottest(Callback.bind(response))