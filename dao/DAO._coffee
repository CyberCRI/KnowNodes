NodeDB = require '../graph/nodeDB'
EdgeDB = require '../graph/edgeDB'
Logger = require '../log/logger'

###
Base class for all DAOs
###
module.exports = class DAO

  constructor: (nodeType, validator, user) ->
    @node = new NodeDB(nodeType, validator, user)
    @edge = new EdgeDB(user)
    @logger = new Logger("dao/DAO(#{nodeType})", user)

  create: (toCreate, _) ->
    #    @logger.info("create (title: #{toCreate.title})")
    @logger.info("create")
    # TODO Make sure there is no existing resource with the same title
    node = @node.create toCreate, _
    return node

  read: (id, _) ->
    @logger.info("read(#{id})")
    return @node.read(id, _)

  update: (id, toUpdate, _) ->
    #    @logger.info("update (id: #{id}, title: #{toUpdate.title})")
    @logger.info("update(#{id})")
    # TODO Check id equals toUpdate.id
    toUpdate.KN_ID = id
    @node.update(id, toUpdate, _)

  delete: (id, _) ->
    @logger.info("delete(#{id})")
    @node.delete(id, _)