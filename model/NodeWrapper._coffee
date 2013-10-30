GraphDB = require '../DB/GraphDB'
Error = require '../error/Error'
NodeWrappers = require '../data/NodeWrappers'
DefaultConverter = require './conversion/DefaultConverter'

module.exports = class NodeWrapper

  @getter = (props) =>
    @::__defineGetter__ name, getter for name, getter of props

  @setter = (props) =>
    @::__defineSetter__ name, setter for name, setter of props

  @getter id: ->
    @getProperty('KN_ID')

  constructor: (@node) ->
    if not @node?
      throw Error.illegalArgument(@node, 'NodeWrapper.constructor()')

  getDB: -> GraphDB.get()

  getId: -> @node.data['KN_ID'] # Old getter, consider removal

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

  toJSON: (_) ->
    @getConverter().toJSON(@, _)

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
    result = @getDB().query(query, params, _)[0]
    if result?
      result.relationship

  hasRelationshipWith: (target, relationshipType, _) ->
    @getRelationshipWith(target, relationshipType, _)?

  deleteRelationshipIfExists: (target, relationshipType, _) ->
    rel = @getRelationshipWith(target, relationshipType, _)
    if rel?
      rel.del(_)

  checkNodeType: (expectedType) ->
    if @getNodeType() is not expectedType
      throw Error.wrongType(expectedType, @getNodeType())

  ###
        METHODS TO IMPLEMENT
  ###

  getNodeType: ->
    @node.data['nodeType']

  getConverter: ->
    DefaultConverter

  validate: ->
    throw Error.notImplemented('NodeWrapper.getValidator()')