Controller = require '../Controller'
Triplets = require '../../data/Triplets'
aggregator = require '../../data/TripletAggregator'
jsonConverter = require '../../model/conversion/json/AggregatedTripletConverter'

module.exports = class TripletController extends Controller

  constructor: (@request) ->
    super(@request, Triplets)

  latest: (_) ->
    @dataService.latest(@getLoggedUserIfExists(_), _)

  hottest: (_) ->
    @dataService.hottest(@getLoggedUserIfExists(_), _)

  aggregatedLatest: (_) ->
    triplets = @latest _
    aggregator.aggregateAndConvert triplets, _

  aggregatedHottest: (_) ->
    triplets = @hottest _
    aggregator.aggregateAndConvert triplets, _