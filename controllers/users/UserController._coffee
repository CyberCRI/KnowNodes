Controller = require '../Controller'
ConnectionDAO = require '../../dao/ConnectionDAO'
Connection = require '../../model/User'


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

  getTripletsByUserId: (_) ->
    console.log("controllerProfile")
    @dao.getTripletsByUserId(@getId() ,@getLoggedUserIdIfExists(), _)