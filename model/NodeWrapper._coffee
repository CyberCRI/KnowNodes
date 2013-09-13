Neo4j = require 'neo4j'
DBConf = require '../config/DB.conf'
Error = require '../error/Error'

module.exports = class NodeWrapper

  ###
        CLASS METHODS
  ###

  @DB = new Neo4j.GraphDatabase(DBConf.getDBURL('neo4j'))

  @getNodeType: ->
    throw Error.notImplemented('NodeWrapper.getNodeType()')

  @getValidator: ->
    throw Error.notImplemented('NodeWrapper.getValidator()')

  @wrap: (node) ->
    throw Error.notImplemented('NodeWrapper.wrap()')

  @create: (data, _) ->
    data.KN_ID = @GUID()
    data.nodeType = @getNodeType()
    data.__CreatedOn__ = Date.now()
    created = @wrap(@DB.createNode(data))
    created.save _
    return created

  @find: (id, _) ->
    @findByProperty('KN_ID', id, _)

  @findByTextProperty: (key, value, _) ->
    @findByProperty(key, value.toLowerCase(), _)

  @findByProperty: (key, value, _) ->
    node = @DB.getIndexedNode(@getNodeType(), key, value, _)
    if not node?
      throw Error.entityNotFound(@getNodeType(), key, value)
    else
      @wrap node

  @listAll: (_) ->
    query = [
      'START everyNode = node(*)',
      'WHERE everyNode.nodeType ?= {nodeType}',
      'RETURN everyNode'
    ].join('\n');
    params = {nodeType: @getNodeType()}
    nodes = @DB.query(query, params, _)
    nodeWrappers = []
    for result in nodes
      wrapped = @wrap(result.everyNode)
      nodeWrappers.push(wrapped)
    nodeWrappers

  # Generates a new Globally Unique ID
  @GUID: () ->
    # TODO Guarantee Uniqueness
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace /[xy]/g, (c) ->
      r = Math.random() * 16 | 0
      v = (if c is "x" then r else (r & 0x3 | 0x8))
      v.toString 16

  ###
        INSTANCE METHODS
  ###

  constructor: (@node) ->
    if not @node?
      throw Error.illegalArgument(@node, 'NodeWrapper.constructor()')

  getDB: -> NodeWrapper.DB

  getId: ->
    @node.data['KN_ID']

  save: (_) ->
    @validate()
    @node.save _
    @index _
    @

  update: (newData, _) ->
    oldData = @node._data.data
    # Make sure creation date is not overwritten
    newData.__CreatedOn__ = oldData.__CreatedOn__
    @node._data.data = newData
    @save _
    @

  delete: (_) ->
    @node.delete _

  forceDelete: (_) ->
    query = """
      START node=node(#{@node.id})
      MATCH node-[rel]-()
      DELETE node, rel
    """
    @getDB().query(query, _)

  index: (_) ->
    @indexProperty('KN_ID', _)
    @indexProperty('__CreatedOn__', _)

  indexProperty: (key, _) ->
    value = @node.data[key]
    if value?
      @node.index(@getNodeType(), key, value, _)

  indexTextProperty: (key, _) ->
    value = @node.data[key]
    if value?
      @node.index(@getNodeType(), key, value.toLowerCase(), _)

  getProperty: (key) ->
    return @node.data[key]

  setProperty: (key, value) ->
    @node.data[key] = value

  getRelationshipWith: (target, relationshipType, _) ->
    query = [
      "START user = node({sourceId}), target = node({targetId})",
      "MATCH user -[relationship:#{relationshipType}]- target",
      "RETURN relationship"
    ].join('\n');
    params =
      sourceId: @node.id
      targetId: target.node.id
    result = NodeWrapper.DB.query(query, params, _)[0]
    console.log("user.id:", @node.id)
    if result?
      console.log("result:", result.relationship)
      result.relationship

  hasRelationshipWith: (target, relationshipType, _) ->
    @getRelationshipWith(target, relationshipType, _)?

  deleteRelationshipIfExists: (target, relationshipType, _) ->
    rel = @getRelationshipWith(target, relationshipType, _)
    if rel?
      rel.del(_)

  ###
        METHODS TO IMPLEMENT
  ###

  getNodeType: ->
    @node.data['nodeType']

  validate: ->
    throw Error.notImplemented('NodeWrapper.getValidator()')