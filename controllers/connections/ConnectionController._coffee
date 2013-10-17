OwnedEntityController = require '../OwnedEntityController'
Connections = require '../../data/Connections'
Resources = require '../../data/Resources'
Error = require '../../error/Error'

module.exports = class ConnectionController extends OwnedEntityController

  constructor: (@request) ->
    super(@request, Connections)

  getId: ->
    @request.params.connection

  create: (_) ->
    data = @request.body
    if (not data.fromNodeId?)
      throw Error.badRequest('fromNodeId', 'String', data.fromNodeId)
    if (not data.toNodeId?)
      Error.badRequest('toNodeId', 'String', @request.body.toNodeId)
    startResource = Resources.find(data.fromNodeId, _)
    endResource = Resources.find(data.toNodeId, _)
    creator = @getLoggedUser _
    @dataService.create(startResource, endResource, creator, data, _)

  destroy: (_) ->
    # Make sure creator made the request
    connection = @dataService.find(@getId(), _)
    user = @getLoggedUser(_)
    if (user.isCreatorOf(connection, _))
      connection.delete _
    else
      Error.forbidden('Connection Deletion', 'You should be the creator of the connection you wish to delete')

  getTripletByConnectionId: (_) ->
    @dataService.getTripletByConnectionId(@getId(), @getLoggedUserIdIfExists(), _)

  latestTriplets: (_) ->
    @dataService.latestTriplets(@getLoggedUserIfExists(_), _)

  hottestTriplets: (_) ->
    @dataService.hottestTriplets(@getLoggedUserIfExists(_), _)

  getTripletsByUserId: (_) ->
    @dataService.getTripletsByUserId(@getId() ,@getLoggedUserIfExists(_), _)
