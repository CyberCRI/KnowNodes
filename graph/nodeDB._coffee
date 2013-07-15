DB = require './DB'
Logger = require '../log/logger'

module.exports = class NodeDB extends DB

  constructor: (@nodeType, @validator, @user) ->
    super
    @logger = new Logger("graph/nodeDB(#{nodeType})", @user)

  create: (data, _) ->
    @logger.debug("create")
    guid = @GUID()
    data.KN_ID = guid
    data.nodeType = @nodeType
    data.__CreatedOn__ = Date.now()
    created = @db.createNode(data)
    created = @save created, _
    created.index(@nodeType, 'KN_ID', guid, _)
    return created

  read: (id, _) ->
    @logger.debug("read(#{id})")
    return @load(id, _)

  update: (id, newData, _) ->
    @logger.debug("update(#{id})")
    node = @load(id, _)
    oldData = node._data.data
    newData.__CreatedOn__ = oldData.__CreatedOn__
    node._data.data = newData
    @save node, _
    return node

  delete: (id, _) =>
    @logger.debug("delete(#{id})")
    node = @load(id, _)
    node.delete _

  save: (node, _) ->
    @validator.validate(node._data.data)
    node.save _

  load: (guid, _) ->
    return @db.getIndexedNode(@nodeType, 'KN_ID', guid, _)

  # Generates a new GUID string
  GUID: () ->
    # TODO Guarantee Uniqueness
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace /[xy]/g, (c) ->
      r = Math.random() * 16 | 0
      v = (if c is "x" then r else (r & 0x3 | 0x8))
      v.toString 16
