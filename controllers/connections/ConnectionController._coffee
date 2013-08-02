Controller = require '../Controller'
ConnectionDAO = require '../../dao/ConnectionDAO'
Connection = require '../../model/Connection'

module.exports = class ConnectionController extends Controller

  constructor: (@request) ->
    super(@request, new ConnectionDAO())

  getId: ->
    @request.params.connection

  getTripletByConnectionId: (_) ->
    @dao.getTripletByConnectionId(@getId(), @getLoggedUserIdIfExists(), _)

  latestTriplets: (_) ->
    Connection.latestTriplets _

  hottestTriplets: (_) ->
    @dao.hottestTriplets(@getLoggedUserIdIfExists(), _)
