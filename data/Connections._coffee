OwnedEntities = require './OwnedEntities'
Type = require './../model/Type'
ConnectionValidator = require './../model/validation/ConnectionValidator'
Connection = require './../model/Connection'
Error = require '../error/Error'

module.exports = class Connections extends OwnedEntities

  @getNodeType: -> Type.CONNECTION

  @wrap: (node) -> new Connection(node)

  # Make sure no connection is made without start and end resources
  @create: (startResource, endResource, creator, data, _) ->
    if (not startResource? or not endResource? or not creator? or not data?)
      throw Error.illegalArgument('null', 'Connections.create()')
    connection = super(data, creator, _)
    startResource.node.createRelationshipTo(connection.node, 'RELATED_TO', {}, _)
    connection.node.createRelationshipTo(endResource.node, 'RELATED_TO', {}, _)
    connection

  @latestTriplets: (user, _) ->
    now = Date.now()
    aWeekAgo = now - 1000 * 60 * 60 * 24 * 7 # Seven days
    luceneQuery = "__CreatedOn__:[#{aWeekAgo} TO #{now}]"

    if (user)
      userNodeId = user.node.id
    else
      userNodeId = 0

    cypherQuery = """
                  START connection=node:kn_Edge('#{luceneQuery}'), user=node(#{userNodeId})
                  MATCH (startResource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (endResource),
                  (connection) -[:CREATED_BY]- (connectionCreator),
                  (startResource) -[?:CREATED_BY]- (startResourceCreator),
                  (endResource) -[?:CREATED_BY]- (endResourceCreator),
                  (connection) -[?:COMMENT_OF]- (connectionComments),
                  (user) -[upvote?:VOTED_UP] - (connection),
                  (user) -[downvote?:VOTED_DOWN] - (connection),
                  (startResourceOtherConnections)-[?:RELATED_TO]-(startResource),
                  (endResourceOtherConnections)-[?:RELATED_TO]-(endResource)
                  WHERE startResource <> endResource
                  AND startResourceOtherConnections <> connection
                  AND endResourceOtherConnections <> connection
                  RETURN upvote, downvote, connection, startResource, endResource, startResourceCreator, endResourceCreator, connectionCreator,
                  count(connectionComments) AS connectionCommentsCount,
                  count(startResourceOtherConnections) AS startResourceOtherConnectionsCount,
                  count(endResourceOtherConnections) AS endResourceOtherConnectionsCount
                  ORDER BY connection.__CreatedOn__ DESC
                  LIMIT 100
                  """

    results = @DB.query(cypherQuery, null, _)
    nodes = []
    for item in results
      toPush =
        connection: item.connection.data
        startResource: item.startResource.data
        endResource: item.startResource.data
      toPush.commentCount = item.connectionCommentsCounts
      toPush.connection.creator = item.connectionCreator.data
      toPush.startResource.creator = item.startResourceCreator?.data
      toPush.endResource.creator = item.endResourceCreator?.data
      toPush.startResource.otherConnectionsCount = item.startResourceOtherConnectionsCount
      toPush.endResource.otherConnectionsCount = item.endResourceOtherConnectionsCount
      toPush.votedUp = item.upvote?
      toPush.votedDown = item.downvote?
      nodes.push toPush
    nodes

  @hottestTriplets: (user, _) ->
    now = Date.now()
    aMonthAgo = now - 1000 * 60 * 60 * 24 * 30 # Thirty days
    luceneQuery = "__CreatedOn__:[#{aMonthAgo} TO #{now}]"

    if (user)
      userNodeId = user.node.id
    else
      userNodeId = 0

    cypherQuery = """
                  START connection=node:kn_Edge('#{luceneQuery}'), user=node(#{userNodeId})
                  MATCH (startResource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (endResource),
                  (connection) -[:CREATED_BY]- (connectionCreator),
                  (startResource) -[?:CREATED_BY]- (startResourceCreator),
                  (endResource) -[?:CREATED_BY]- (endResourceCreator),
                  (connection) -[?:COMMENT_OF]- (connectionComments),
                  (connection) -[?:VOTED_UP]- (upvotes),
                  (connection) -[?:VOTED_DOWN]- (downvotes),
                  (user) -[hasVotedUp?:VOTED_UP]-> (connection),
                  (user) -[hasVotedDown?:VOTED_DOWN]-> (connection),
                  (startResourceOtherConnections)-[?:RELATED_TO]-(startResource),
                  (endResourceOtherConnections)-[?:RELATED_TO]-(endResource)
                  WHERE startResource <> endResource
                  AND startResourceOtherConnections <> connection
                  AND endResourceOtherConnections <> connection
                  RETURN connection, startResource, endResource, startResourceCreator, endResourceCreator, connectionCreator,
                  count(distinct connectionComments) AS commentCount,
                  count(distinct upvotes) AS upvoteCount,
                  count(distinct downvotes) AS downvoteCount,
                  count(distinct startResourceOtherConnections) AS startResourceOtherConnectionCount,
                  count(distinct endResourceOtherConnections) AS endResourceOtherConnectionCount,
                  hasVotedUp, hasVotedDown
                  ORDER BY connection.__CreatedOn__ DESC
                  LIMIT 200
                  """
    noveltyInDays = (creationDate) ->
      seconds = creationDate / 1000 - 1370000000
      seconds / (3600 * 24) # Days

    hotness = (upvotes, downvotes, creationDate) ->
      score = upvotes - downvotes
      novelty = noveltyInDays(creationDate)
      if score > 0
        sign = 1
      else if score < 0
        sign = -1
      else
        sign = 0
      voteBoost = 3
      order = Math.log(Math.max(Math.abs(score), 1)) * voteBoost * sign
      Math.round((order + novelty) * 10)

    results = @DB.query(cypherQuery, null, _)
    nodes = []
    for item in results

      toPush =
        upvotes: item.upvoteCount
        downvotes: item.downvoteCount
        userUpvoted: item.hasVotedUp
        userDownvoted: item.hasVotedDown
        startResource: item.startResource.data
        endResource: item.endResource.data
        connection: item.connection.data

      toPush.commentCount = item.commentCount
      toPush.connection.creator = item.connectionCreator.data
      if toPush.connection.status is "deleted"
        toPush.connection.creator.firstName = "deleted"
        toPush.connection.creator.lastName = " "
        toPush.connection.creator.KN_ID = "deleted"
        toPush.connection.creator.dateOfBirth = "deleted"
        toPush.connection.creator.email = "deleted"
        toPush.connection.creator.email = "deleted"
        toPush.connection.creator.password = "deleted"

      hot = hotness(item.upvoteCount, item.downvoteCount, item.connection.data['__CreatedOn__'])
      toPush.connection.hotness = hot
      toPush.startResource.creator = item.startResourceCreator?.data
      toPush.endResource.creator = item.endResourceCreator?.data
      toPush.startResource.connectionCount = item.startResourceOtherConnectionCount
      toPush.endResource.connectionCount = item.endResourceOtherConnectionCount

      nodes.push toPush

    nodes