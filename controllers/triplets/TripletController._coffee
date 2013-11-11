Controller = require '../Controller'
Triplets = require '../../data/Triplets'

module.exports = class TripletController extends Controller

  constructor: (@request) ->
    super(@request, Triplets)

  latest: (_) ->
    @dataService.latest(@getLoggedUserIfExists(_), _)

  hottest: (_) ->
    @dataService.hottest(@getLoggedUserIfExists(_), _)