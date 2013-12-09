Controller = require '../Controller'
Triplets = require '../../data/Triplets'
Users = require '../../data/Users'
aggregator = require '../../data/TripletAggregator'
jsonConverter = require '../../model/conversion/json/AggregatedTripletConverter'

module.exports = class UserController extends Controller

  constructor: (@request) ->
    super(@request, Users)

  getId: ->
    @request.params.user

  create: (_) ->
    # Skip logged in check
    @dataService.create(@request.body, _)

  findByEmail: (_) ->
    email = @request.body.email
    @dataService.findByEmail(email, _)

  karma: (_) ->
    karma = @dataService.karma(@getId(), _)
    return {karma: karma}

  triplets: (_) ->
    userId = @getId()
    loggedUserId = @getLoggedUserIdIfExists()
    Triplets.findByUserId(userId, loggedUserId, _)

  aggregatedTriplets: (_) ->
    triplets = @triplets _
    aggregator.aggregateAndConvert triplets, _