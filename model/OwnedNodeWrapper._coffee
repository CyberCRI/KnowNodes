NodeWrapper = require './NodeWrapper'
User = require './User'

module.exports = class OwnedNodeWrapper extends NodeWrapper

  getCreator: (_) ->
    query = """
      START connection=node(#{@node.id})
      MATCH connection-[:CREATED_BY]-creator
      RETURN creator
    """
    creatorNode = @getDB().query(query, _)[0].creator
    new User(creatorNode)
