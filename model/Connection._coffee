OwnedNodeWrapper = require './OwnedNodeWrapper'
Type = require './Type'
Validator = require './validation/ConnectionValidator'
JsonConverter = require './conversion/json/ConnectionConverter'
GexfConverter = require './conversion/gexf/ConnectionConverter'

module.exports = class Connection extends OwnedNodeWrapper

  @getter title: ->
    @getProperty('title')

  @getter startResourceId: ->
    @getProperty('fromNodeId')

  @getter endResourceId: ->
    @getProperty('toNodeId')

  @getter status: ->
    @getProperty('status')

  validate: ->
    new Validator().validate(@node.data)

  getJsonConverter: ->
    JsonConverter

  hasGexfConverter: -> true

  toGEXF: (_) ->
    GexfConverter.toGEXF(@, _)

  delete: (_) ->
    # Make sure has no comments
    query = """
      START node = node(#{@node.id})
      match node-[rel:COMMENT_OF]-()
      RETURN count(rel) as connectionCount
    """
    count = @getDB().query(query, _)[0].connectionCount
    if (count is 0)
      @forceDelete _
      return "forceDelete"
    else
      @disown _
      return "disown"

  disown: (_) ->
    @setProperty('status', 'deleted');
    @save _