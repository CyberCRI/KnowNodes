Resources = require './Resources'
Users = require './Users'
Resource = require '../model/Resource'
Connection = require '../model/Connection'
User = require '../model/User'
Triplet = require '../model/Triplet'
GraphDB = require '../DB/GraphDB'
Error = require '../error/Error'

module.exports =

  
  findByUserId: (userId, loggedUserId, _) ->
    user = Users.find(userId, _)

    if loggedUserId?
      loggedUser = Users.find(loggedUserId, _)
    else
      loggedUser = {node: {id: 0}}

    query = """
            START connectionCreator=node(#{user.node.id}), user=node(#{loggedUser.node.id})
            MATCH (connection) -[:CREATED_BY]- (connectionCreator),
              (startResource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (endResource),
              (startResource) -[:CREATED_BY]- (startResourceCreator),
              (endResource) -[:CREATED_BY]- (endResourceCreator),
              (connection) -[?:COMMENT_OF]- (connectionComments),
              (connection) -[?:VOTED_UP]- (upvotes),
              (connection) -[?:VOTED_DOWN]- (downvotes),
              (user) -[hasVotedUp?:VOTED_UP]-> (connection),
              (user) -[hasVotedDown?:VOTED_DOWN]-> (connection),
              (startResourceConnections)-[?:RELATED_TO]-(startResource),
              (endResourceConnections)-[?:RELATED_TO]-(endResource)
            WHERE NOT(HAS(connection.status))
            AND connection.nodeType! = 'kn_Edge'
            RETURN connection, startResource, endResource, startResourceCreator, endResourceCreator,
              count(distinct connectionComments) AS commentCount,
              count(distinct upvotes) AS upvoteCount,
              count(distinct downvotes) AS downvoteCount,
              count(distinct startResourceConnections) AS startResourceConnectionCount,
              count(distinct endResourceConnections) AS endResourceConnectionCount,
              count(distinct hasVotedUp) AS userVotedUp,
              count(distinct hasVotedDown) AS userVotedDown
            """

    connectionCreator = user

    results = GraphDB.get().query(query, null, _)
    triplets = []
    for row in results
      data = @extractData(row)
      connection = new Connection(row.connection, connectionCreator.node)
      startResource = new Resource(row.startResource, row.startResourceCreator)
      endResource = new Resource(row.endResource, row.endResourceCreator)
      triplet = new Triplet(connection, startResource, endResource, data)
      triplets.push triplet
    triplets


  extractData: (row) ->
    data =
      upvotes: row.upvoteCount
      downvotes: row.downvoteCount
      userUpvoted: row.userVotedUp is 1
      userDownvoted: row.userVotedDown is 1
      commentCount: row.commentCount
      startResourceConnectionCount: row.startResourceConnectionCount
      endResourceConnectionCount: row.endResourceConnectionCount
    data


  findByResourceId: (resourceId, user, _) ->
    if user?
      userNodeId = user.node.id
    else
      userNodeId = 0

    outgoingRelation = '(resource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (otherResource)'
    incomingRelation = '(resource) <-[:RELATED_TO]- (connection) <-[:RELATED_TO]- (otherResource)'
    query = (relation) -> """
            START resource = node({resourceNodeId}), user = node(#{userNodeId})
            MATCH #{relation},
              (resource) -[:CREATED_BY]- (resourceCreator),
              (otherResource) -[:CREATED_BY]- (otherResourceCreator),
              (otherResource) -[?:RELATED_TO]- (otherResourceConnections),
              (connection) -[?:VOTED_UP]- (upvotes),
              (connection) -[?:VOTED_DOWN]- (downvotes),
              (connection) -[:CREATED_BY]- (connectionCreator),
              (user) -[hasVotedUp?:VOTED_UP]-> (connection),
              (user) -[hasVotedDown?:VOTED_DOWN]-> (connection),
              (connection) -[?:COMMENT_OF]- (comments)
            RETURN connection, connectionCreator, resource, resourceCreator, otherResource, otherResourceCreator,
              count(distinct comments) AS commentCount,
              count(distinct otherResourceConnections) AS otherResourceConnectionCount,
              count(distinct upvotes) AS upVoteCount,
              count(distinct downvotes) AS downVoteCount,
              count(distinct hasVotedUp) AS userVotedUp,
              count(distinct hasVotedDown) AS userVotedDown
            """
    outgoingQuery = query(outgoingRelation)
    incomingQuery = query(incomingRelation)

    resource = Resources.find(resourceId, _)
    params =
      resourceNodeId: resource.node.id
    outgoingResults = GraphDB.get().query(outgoingQuery, params, _)
    incomingResults = GraphDB.get().query(incomingQuery, params, _)
    resourceConnectionCount = outgoingResults.length + incomingResults.length
    triplets = []

    makeTriplet = (row, startResource, endResource, startResourceConnectionCount, endResourceConnectionCount) ->
      data =
        upvotes: row.upVoteCount
        downvotes: row.downVoteCount
        userUpvoted: row.hasVotedUp?
        userDownvoted: row.hasVotedDown?
        commentCount: row.commentCount
        startResourceConnectionCount: startResourceConnectionCount
        endResourceConnectionCount: endResourceConnectionCount
      connection = new Connection(row.connection, row.connectionCreator)
      new Triplet(connection, startResource, endResource, data)

    for row in outgoingResults
      startResource = new Resource(row.resource, row.resourceCreator)
      endResource = new Resource(row.otherResource, row.otherResourceCreator)
      startResourceConnectionCount = resourceConnectionCount
      endResourceConnectionCount = row.otherResourceConnectionCount
      triplets.push makeTriplet(row, startResource, endResource, startResourceConnectionCount, endResourceConnectionCount)

    for row in incomingResults
      startResource = new Resource(row.otherResource, row.otherResourceCreator)
      endResource = new Resource(row.resource, row.resourceCreator)
      startResourceConnectionCount = row.otherResourceConnectionCount
      endResourceConnectionCount = resourceConnectionCount
      triplets.push makeTriplet(row, startResource, endResource, startResourceConnectionCount, endResourceConnectionCount)

    triplets


  findByConnectionId: (connectionId, userId, _) ->
    Connections = require './Connections'
    connection = Connections.find(connectionId, _)

    if userId?
      user = Users.find(userId, _)
      userNodeId = user.node.id
    else
      userNodeId = 0

    query = """
            START connection=node(#{connection.node.id}), user=node(#{userNodeId})
            MATCH (startResource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (endResource),
              (connection) -[:CREATED_BY]- (connectionCreator),
              (startResource) -[:CREATED_BY]- (startResourceCreator),
              (endResource) -[:CREATED_BY]- (endResourceCreator),
              (connection) -[?:COMMENT_OF]- (connectionComments),
              (connection) -[?:VOTED_UP]- (upvotes),
              (connection) -[?:VOTED_DOWN]- (downvotes),
              (user) -[hasVotedUp?:VOTED_UP]-> (connection),
              (user) -[hasVotedDown?:VOTED_DOWN]-> (connection),
              (startResourceConnections)-[?:RELATED_TO]-(startResource),
              (endResourceConnections)-[?:RELATED_TO]-(endResource)
            RETURN connection, startResource, endResource, connectionCreator, startResourceCreator, endResourceCreator,
              count(distinct connectionComments) AS commentCount,
              count(distinct upvotes) AS upvoteCount,
              count(distinct downvotes) AS downvoteCount,
              count(distinct startResourceConnections) AS startResourceConnectionCount,
              count(distinct endResourceConnections) AS endResourceConnectionCount,
              count(distinct hasVotedUp) AS userVotedUp,
              count(distinct hasVotedDown) AS userVotedDown
            """
    console.log query
    result = GraphDB.get().query(query, _)[0]
    triplet = @extractTriplet(result)
    triplet


  extractTriplet: (row) ->
    data = @extractData(row)
    connection = new Connection(row.connection, row.connectionCreator)
    startResource = new Resource(row.startResource, row.startResourceCreator)
    endResource = new Resource(row.endResource, row.endResourceCreator)
    new Triplet(connection, startResource, endResource, data)


  latest: (user, _) ->
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
              (startResource) -[:CREATED_BY]- (startResourceCreator),
              (endResource) -[:CREATED_BY]- (endResourceCreator),
              (connection) -[?:COMMENT_OF]- (connectionComments),
              (user) -[hasVotedUp?:VOTED_UP] - (connection),
              (user) -[hasVotedDown?:VOTED_DOWN] - (connection),
              (startResourceConnections)-[?:RELATED_TO]-(startResource),
              (endResourceConnections)-[?:RELATED_TO]-(endResource)
            RETURN hasVotedUp, hasVotedDown, connection, startResource, endResource, startResourceCreator, endResourceCreator, connectionCreator,
              count(connectionComments) AS connectionCommentsCount,
              count(startResourceConnections) AS startResourceConnectionCount,
              count(endResourceConnections) AS endResourceConnectionCount,
              count(distinct hasVotedUp) AS userVotedUp,
              count(distinct hasVotedDown) AS userVotedDown
            ORDER BY connection.__CreatedOn__ DESC
            LIMIT 100
          """

    console.log cypherQuery

    results = GraphDB.get().query(cypherQuery, null, _)
    triplets = []
    for row in results
      triplet = @extractTriplet(row)
      triplets.push triplet
    triplets


  hottest: (user, _) ->
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
              (startResource) -[:CREATED_BY]- (startResourceCreator),
              (endResource) -[:CREATED_BY]- (endResourceCreator),
              (connection) -[?:COMMENT_OF]- (connectionComments),
              (connection) -[?:VOTED_UP]- (upvotes),
              (connection) -[?:VOTED_DOWN]- (downvotes),
              (user) -[hasVotedUp?:VOTED_UP]-> (connection),
              (user) -[hasVotedDown?:VOTED_DOWN]-> (connection),
              (startResourceConnections) -[?:RELATED_TO]- (startResource),
              (endResourceConnections) -[?:RELATED_TO]- (endResource)
            RETURN connection, startResource, endResource, connectionCreator, startResourceCreator, endResourceCreator,
              count(distinct connectionComments) AS commentCount,
              count(distinct upvotes) AS upvoteCount,
              count(distinct downvotes) AS downvoteCount,
              count(distinct startResourceConnections) AS startResourceConnectionCount,
              count(distinct endResourceConnections) AS endResourceConnectionCount,
              count(distinct hasVotedUp) AS userVotedUp,
              count(distinct hasVotedDown) AS userVotedDown
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

    results = GraphDB.get().query(cypherQuery, null, _)
    triplets = []
    for row in results
      triplet = @extractTriplet(row)
      triplet.data.hotness = hotness(row.upvoteCount, row.downvoteCount, triplet.connection.creationDate)
      triplets.push triplet
    triplets