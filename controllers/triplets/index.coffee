TripletController = require('./TripletController')
Callback = require('../Callback')

module.exports =

  latest: (request, response) ->
    new TripletController(request).latest(Callback.bind(response))

  hottest: (request, response) ->
    new TripletController(request).hottest(Callback.bind(response))