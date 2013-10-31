OwnedEntities = require './OwnedEntities'
Type = require './../model/Type'
ConnectionValidator = require './../model/validation/ConnectionValidator'
Connection = require './../model/Connection'
Notifications = require './Notifications'
Error = require '../error/Error'

module.exports = class Connections extends OwnedEntities

  @getNodeType: -> Type.CONNECTION

  @wrap: (node) -> new Connection(node)

  # Make sure no connection is made without start and end resources
  @create: (startResource, endResource, creator, data, _) ->
    if not startResource? or not endResource? or not creator? or not data?
      throw Error.illegalArgument('null', 'Connections.create()')
    connection = super(data, creator, _)
    startResource.node.createRelationshipTo(connection.node, 'RELATED_TO', {}, _)
    connection.node.createRelationshipTo(endResource.node, 'RELATED_TO', {}, _)
    Notifications.notifyConnectionCreated(startResource, endResource, connection, creator, _)
    connection