OwnedEntities = require './OwnedEntities'
Type = require './../model/Type'
Comment = require './../model/Comment'

module.exports = class Comments extends OwnedEntities

  @getNodeType: -> Type.COMMENT

  @wrap: (node) -> new Comment(node)

  @create: (data, connection, creator, _) ->
    if not data? or not connection? or not creator?
      throw Error.illegalArgument('null', 'Comments.create()')
    comment = super(data, creator, _)
    comment.node.createRelationshipTo(connection.node, 'COMMENT_OF', {}, _)
    comment

  @findByConnectionId: (connection, _) ->
    @logger.logDebug @currentModule, "getAllComments #{nodeId}"
    query = [
      'START root=node({nodeId})',
      'MATCH (root) <-[r:COMMENT_OF*]- (comment) -[u:CREATED_BY]-> (commentUser)',
      'RETURN comment, r, commentUser'
    ].join('\n');

    params =
      nodeId: nodeId

    @queryAndFormatCommentResults query, params, _