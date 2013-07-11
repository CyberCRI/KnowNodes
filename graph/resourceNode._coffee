Node = require './node'

module.exports = class ResourceNode extends Node

  constructor: (user) ->
    super("graph/resourceNode", user)

  create: (toCreate, _) ->
    @logger.debug("create")
    created = @DB.Resource.create toCreate, _
    @edge.addCreatedByRelationship(created, _)
    created.id = created.KN_ID
    return created

  read: (id, _) ->
    @logger.debug("read(#{id})")
    resource = @loadFromUID(id, _)
    resource.id = resource.KN_ID
    return resource

  update: (id, toUpdate, _) ->
    @logger.debug("update(#{id})")
    resource = @loadFromUID(id, _)
    resource.updateAttributes(toUpdate, _)
    resource.id = resource.KN_ID
    return resource

  delete: (id, _) =>
    @logger.debug("delete(#{id})")
    resource = @loadFromUID(id, _)
    resource.destroy _

  loadFromUID: (uid, _) ->
    params = where: {KN_ID: uid}
    return @DB.Resource.findOne(params, _)
