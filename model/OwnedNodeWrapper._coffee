NodeWrapper = require './NodeWrapper'
User = require './User'

module.exports = class OwnedNodeWrapper extends NodeWrapper

  constructor: (node, creatorNode) ->
    super(node)
    if creatorNode?
      @creator = new User(creatorNode)

  getCreator: (_) ->
    if not @creator?
      @loadCreator _
    @creator

  loadCreator: (_) ->
    query = """
        START connection=node(#{@node.id})
        MATCH connection-[:CREATED_BY]-creator
        RETURN creator
      """
    creatorNode = @getDB().query(query, _)[0].creator
    @creator = new User(creatorNode)
