Node = require './node'

module.exports = class ConnectionNode extends Node

  constructor: (user) ->
    super("graph/connectionNode", user)

  create: (toCreate, _) ->
    @logger.debug("create")
    created = @DB.Connection.create toCreate, _
    @edge.addCreatedByRelationship(created, _)
    created.id = created.KN_ID
    return created

  read: (id, _) ->
    @logger.debug("read(#{id})")
    connection = @loadFromUID(id, _)
    connection.id = connection.KN_ID
    return connection

  update: (id, toUpdate, _) ->
    @logger.debug("update(#{id})")
    connection = @loadFromUID(id, _)
    connection.updateAttributes(toUpdate, _)
    connection.id = connection.KN_ID
    return connection

  delete: (id, _) =>
    @logger.debug("delete(#{id})")
    connection = @loadFromUID(id, _)
    connection.destroy _

  loadFromUID: (uid, _) ->
    params = where: {KN_ID: uid}
    return @DB.Connection.findOne(params, _)
