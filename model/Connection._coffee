OwnedNodeWrapper = require './OwnedNodeWrapper'
Type = require './Type'
ConnectionValidator = require './validation/connectionValidator'

module.exports = class Connection extends OwnedNodeWrapper

  @getter title: ->
    @getProperty('title')

  validate: ->
    new ConnectionValidator().validate(@node.data)

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