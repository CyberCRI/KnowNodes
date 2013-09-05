NodeWrapper = require './NodeWrapper'
Type = require './Type'
ConnectionValidator = require './validation/connectionValidator'

module.exports = class Connection extends NodeWrapper

  ###
        CLASS METHODS
  ###

  @getNodeType: -> Type.CONNECTION

  @wrap: (node) -> new Connection(node)

  # Overrides parent method to make sure the resource has a CREATED_BY relationship
  @create: (data, creator, _) ->
    console.log("data:", data)
    console.log("creator:", creator)

    data.active = true
    created = super(data, _)
    creator.setAsCreator(created, _)
    return created

  @getTripletByConnectionId: (id, user, _) ->
    nodes = []

    if user == "no user"
      user = {}
      user.node = {}
      user.node.id = 0

    query = """
      START connection=node({connectionNodeId}), user=node(#{user.node.id})
      MATCH (startResource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (endResource),
      (connection) -[:CREATED_BY]- (connectionCreator),
      (startResource) -[:CREATED_BY]- (startResourceCreator),
      (endResource) -[:CREATED_BY]- (endResourceCreator),
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
    """
    connection = @find(id, _)
    params =
      connectionNodeId: connection.node.id

    results = @DB.query(query, params, _)
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
      toPush.startResource.creator = item.startResourceCreator.data
      toPush.endResource.creator = item.endResourceCreator.data
      toPush.startResource.connectionCount = item.startResourceOtherConnectionCount
      toPush.endResource.connectionCount = item.endResourceOtherConnectionCount
      nodes.push toPush
    nodes

  @getTripletsByUserId: (userProfile, user, _) ->
    nodes = []

    if user == "no user"
      user = {}
      user.node = {}
      user.node.id = 0

    query = """
            START connectionCreator=node({userProfileNodeId}), user=node(#{user.node.id})
            MATCH (connection) -[:CREATED_BY]- (connectionCreator),
            (startResource) -[:RELATED_TO]- (connection) -[:RELATED_TO]-> (endResource),
            (startResource) -[:CREATED_BY]- (startResourceCreator),
            (endResource) -[:CREATED_BY]- (endResourceCreator),
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
            AND connection.nodeType = "kn_Edge"
            RETURN connection, startResource, endResource, connectionCreator, startResourceCreator, endResourceCreator,
            count(distinct connectionComments) AS commentCount,
            count(distinct upvotes) AS upvoteCount,
            count(distinct downvotes) AS downvoteCount,
            count(distinct startResourceOtherConnections) AS startResourceOtherConnectionCount,
            count(distinct endResourceOtherConnections) AS endResourceOtherConnectionCount,
            hasVotedUp, hasVotedDown
            """
    params =
      userProfileNodeId: userProfile.node.id

    results = @DB.query(query, params, _)

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
      toPush.startResource.creator = item.startResourceCreator.data
      toPush.endResource.creator = item.endResourceCreator.data
      toPush.startResource.connectionCount = item.startResourceOtherConnectionCount
      toPush.endResource.connectionCount = item.endResourceOtherConnectionCount
      nodes.push toPush
    nodes

  @connect: (startResource, endResource, user, data, _) ->
    relationshipData =
      creationDate: new Date()
    connection = @create(data, user, _)
    startResource.node.createRelationshipTo(connection.node, 'RELATED_TO', relationshipData, _)
    connection.node.createRelationshipTo(endResource.node, 'RELATED_TO', relationshipData, _)
    return connection

  @latestTriplets: (user, _) ->
    now = Date.now()
    aWeekAgo = now - 1000 * 60 * 60 * 24 * 7 # Seven days
    luceneQuery = "__CreatedOn__:[#{aWeekAgo} TO #{now}]"

    cypherQuery = """
      START connection=node:kn_Edge('#{luceneQuery}'), user=node('#{user.node.id}')
      MATCH (startResource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (endResource),
      (connection) -[:CREATED_BY]- (connectionCreator),
      (startResource) -[:CREATED_BY]- (startResourceCreator),
      (endResource) -[:CREATED_BY]- (endResourceCreator),
      (connection) -[?:COMMENT_OF]- (connectionComments),
      (user) -[upvote?:VOTED_UP] - (connection)
      (user) -[downvote?:VOTED_DOWN] - (connection)
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
      toPush.startResource.creator = item.startResourceCreator.data
      toPush.endResource.creator = item.endResourceCreator.data
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
    if user == "no user"
      user = {}
      user.node = {}
      user.node.id = 0
    cypherQuery = """
      START connection=node:kn_Edge('#{luceneQuery}'), user=node(#{user.node.id})
      MATCH (startResource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (endResource),
      (connection) -[:CREATED_BY]- (connectionCreator),
      (startResource) -[:CREATED_BY]- (startResourceCreator),
      (endResource) -[:CREATED_BY]- (endResourceCreator),
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
      hot = hotness(item.upvoteCount, item.downvoteCount, item.connection.data['__CreatedOn__'])
      toPush.connection.hotness = hot
      toPush.startResource.creator = item.startResourceCreator.data
      toPush.endResource.creator = item.endResourceCreator.data
      toPush.startResource.connectionCount = item.startResourceOtherConnectionCount
      toPush.endResource.connectionCount = item.endResourceOtherConnectionCount
      nodes.push toPush
    nodes

  ###
        INSTANCE METHODS
  ###

  constructor: (node) ->
    super node

  validate: ->
    new ConnectionValidator().validate(@node.data)