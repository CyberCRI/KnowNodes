Neo4j = require 'neo4j'
GraphDB = require '../DB/GraphDB'
Error = require '../error/Error'

module.exports = class NodeWrappers

  @DB = GraphDB.get()

  @getNodeType: ->
    throw Error.notImplemented('NodeWrapperService.getNodeType()')

  @getValidator: ->
    throw Error.notImplemented('NodeWrapperService.getValidator()')

  @wrap: (node) ->
    throw Error.notImplemented('NodeWrapperService.wrap()')

  @create: (data, _) ->
    data.KN_ID = @GUID()
    data.nodeType = @getNodeType()
    data.__CreatedOn__ = Date.now()
    created = @wrap(@DB.createNode(data))
    created.save _
    created

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
