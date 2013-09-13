Controller = require '../Controller'
ConnectionDAO = require '../../dao/ConnectionDAO'
Connection = require '../../model/Connection'
Error = require '../../error/Error'

module.exports = class ConnectionController extends Controller

  constructor: (@request) ->
    super(@request, new ConnectionDAO())

  getId: ->
    @request.params.connection

  destroy: (_) ->
    # Make sure creator made the request
    connection = Connection.find(@getId(), _)
    user = @getLoggedUser(_)
    if (user.isCreatorOf(connection, _))
      connection.delete _
    else
      Error.forbidden('Connection Deletion', 'You should be the creator of the connection you wish to delete')

  getTripletByConnectionId: (_) ->
    @dao.getTripletByConnectionId(@getId(), @getLoggedUserIdIfExists(), _)

  latestTriplets: (_) ->
    Connection.latestTriplets _

  hottestTriplets: (_) ->
    @dao.hottestTriplets(@getLoggedUserIdIfExists(), _)

  getTripletsByUserId: (_) ->
    console.log("controllerProfile")
    @dao.getTripletsByUserId(@getId() ,@getLoggedUserIdIfExists(), _)
