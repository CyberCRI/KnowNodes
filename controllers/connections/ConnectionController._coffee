Controller = require '../Controller'
ConnectionDAO = require '../../dao/ConnectionDAO'
Connection = require '../../model/Connection'

module.exports = class ConnectionController extends Controller

  constructor: (@request) ->
    super(@request, new ConnectionDAO())

  getId: ->
    @request.params.connection

  latestTriplets: (_) ->
    Connection.latestTriplets _