BaseDAO = require './baseDAO'
ResourceNode = require '../graph/resourceNode'
Logger = require '../log/logger'

module.exports = class ResourceDAO extends BaseDAO

  constructor: (user) ->
    super('dao/resourceDAO', user)
    @resourceNode = new ResourceNode(user)

  create: (toCreate, _) ->
    @logger.info("create (title: #{toCreate.title})")
    # TODO Make sure there is no existing resource with the same title
    return @resourceNode.create toCreate, _

  read: (id, _) ->
    @logger.info("read(#{id})")
    return @resourceNode.read(id, _)

  update: (id, toUpdate, _) ->
    @logger.info("update (id: #{id}, title: #{toUpdate.title})")
    @resourceNode.update(id, toUpdate, _)

  delete: (id, _) ->
    @logger.info("delete(#{id})")
    @resourceNode.delete(id, _)