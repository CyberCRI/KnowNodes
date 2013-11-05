OwnedEntities = require './OwnedEntities'
Type = require './../model/Type'
Comment = require './../model/Comment'
Notifications = require './Notifications'

module.exports = class Comments extends OwnedEntities

  @getNodeType: ->
    Type.COMMENT

  @wrap: (node) ->
    new Comment(node)

  @create: (data, connection, creator, _) ->
    if not data? or not connection? or not creator?
      throw Error.illegalArgument('null', 'Comments.create()')
    comment = super(data, creator, _)
    comment.node.createRelationshipTo(connection.node, 'COMMENT_OF', {}, _)
    Notifications.notifyCommentCreated(comment, connection, creator, _)
    comment

  @findByConnection: (connection, _) ->

    query = """
      START connection = node({connectionId})
      MATCH (connection) <-[:COMMENT_OF]- (comment) -[:CREATED_BY]-> (user)
      RETURN comment, user
    """

    params =
      connectionId: connection.node.id

    results = @DB.query(query, params, _)
    comments = []
    for row in results
      comment = new Comment(row.comment)
      comments.push comment
    comments
