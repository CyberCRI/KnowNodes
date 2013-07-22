Neo4j = require 'neo4j'
DBConf = require '../config/DB.conf'
Error = require '../error/Error'

module.exports = class NodeWrapper

  ###
        CLASS METHODS
  ###

  @DB: new Neo4j.GraphDatabase(DBConf.getDBURL('neo4j'))

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

  index: (_) ->
    @indexProperty('KN_ID',_)

  indexProperty: (key, _) ->
    @node.index(@node.data['nodeType'], key, @node.data[key], _)

  indexTextProperty: (key, _) ->
    @node.index(@node.data['nodeType'], key, @node.data[key].toLowerCase(), _)

  ###
        METHODS TO IMPLEMENT
  ###

  validate: ->
    throw Error.notImplemented('NodeWrapper.getValidator()')