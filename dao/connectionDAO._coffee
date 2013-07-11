BaseDAO = require './baseDAO'
ConnectionNode = require '../graph/connectionNode'
Logger = require '../log/logger'

module.exports = class ConnectionDAO extends BaseDAO

  constructor: (user) ->
    super('dao/connectionDAO', user)
    @connectionNode = new ConnectionNode(user)

  create: (toCreate, _) ->
    @logger.info("create (title: #{toCreate.title})")
    return @connectionNode.create toCreate, _

  read: (id, _) ->
    @logger.info("read(#{id})")
    return @connectionNode.read(id, _)

  update: (id, toUpdate, _) ->
    @logger.info("update (id: #{id}, title: #{toUpdate.title})")
    @connectionNode.update(id, toUpdate, _)

  delete: (id, _) ->
    @logger.info("delete(#{id})")
    @connectionNode.delete(id, _)