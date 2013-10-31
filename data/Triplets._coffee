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
            START connectionCreator=node({userNodeId}), user=node(#{loggedUser.node.id})
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
            RETURN connection, startResource, endResource, startResourceCreator, endResourceCreator, hasVotedUp, hasVotedDown,
              count(distinct connectionComments) AS commentCount,
              count(distinct upvotes) AS upvoteCount,
              count(distinct downvotes) AS downvoteCount,
              count(distinct startResourceConnections) AS startResourceConnectionCount,
              count(distinct endResourceConnections) AS endResourceConnectionCount
            """
    params =
      userNodeId: user.node.id

    connectionCreator = user

    results = GraphDB.get().query(query, params, _)
    triplets = []
    for row in results
      data = @extractData(row)
      connection = new Connection(row.connection, connectionCreator.node)
      startResource = new Resource(row.startResource, row.startResourceCreator)
      endResource = new Resource(row.endResource, row.endResourceCreator)
      triplet = new Triplet(connection, startResource, endResource, data)
      json = triplet.toJSON _
      triplets.push json
    triplets

  extractData: (row) ->
    data =
      upvotes: row.upvoteCount
      downvotes: row.downvoteCount
      userUpvoted: row.hasVotedUp?
      userDownvoted: row.hasVotedDown?
      commentCount: row.commentCount
      startResourceConnectionCount: row.startResourceConnectionCount
      endResourceConnectionCount: row.endResourceConnectionCount
    data

  findByResourceId: (resourceId, user, _) ->
    if user?
      userNodeId = user.node.id
    else
      userNodeId = 0

    query = """
            START thisResource=node({resourceNodeId}), user=node(#{userNodeId})
            MATCH (thisResource) -[:RELATED_TO]- (connection) -[:RELATED_TO]- (thatResource),
              (thisResource) -[:CREATED_BY]- (thisResourceCreator),
              (thatResource) -[:CREATED_BY]- (thatResourceCreator),
              (thatResourceConnections)-[?:RELATED_TO]-(thatResource),
              (connection) -[?:VOTED_UP]- (upvotes),
              (connection) -[?:VOTED_DOWN]- (downvotes),
              (connection) -[:CREATED_BY]- (connectionCreator),
              (user) -[hasVotedUp?:VOTED_UP]-> (connection),
              (user) -[hasVotedDown?:VOTED_DOWN]-> (connection),
              (connection) -[?:COMMENT_OF]- (comments)
            RETURN connection, connectionCreator, thisResource, thisResourceCreator, thatResource, thatResourceCreator, hasVotedUp, hasVotedDown,
              count(distinct comments) AS commentCount,
              count(distinct thatResourceConnections) AS thatResourceConnectionCount,
              count(distinct upvotes) AS upVoteCount,
              count(distinct downvotes) AS downVoteCount
            """
    resource = Resources.find(resourceId, _)
    params =
      resourceNodeId: resource.node.id

    results = GraphDB.get().query(query, params, _)
    triplets = []
    for row in results
      data =
        upvotes: row.upVoteCount
        downvotes: row.downVoteCount
        userUpvoted: row.hasVotedUp?
        userDownvoted: row.hasVotedDown?
        commentCount: row.commentCount
      connection = new Connection(row.connection, row.connectionCreator)
      thisResource = new Resource(row.thisResource, row.thisResourceCreator)
      thatResource = new Resource(row.thatResource, row.thatResourceCreator)

      startResource
      endResource

      if thisResource.id is connection.startResourceId and thatResource.id is connection.endResourceId
        startResource = thisResource
        endResource = thatResource
        data.startResourceConnectionCount = results.length
        data.endResourceConnectionCount = row.thatResourceConnectionCount
      else if thisResource.id is connection.endResourceId and thatResource.id is connection.startResourceId
        startResource = thatResource
        endResource = thisResource
        data.startResourceConnectionCount = row.thatResourceConnectionCount
        data.endResourceConnectionCount = results.length
      else
        throw 'Should never happen : one of those two conditions should have been true, there must be an error in the code (Triplets.findByResourceId())'
      triplet = new Triplet(connection, startResource, endResource, data)
      json = triplet.toJSON _
      triplets.push json
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
              hasVotedUp, hasVotedDown
            """

    result = GraphDB.get().query(query, _)[0]
    triplet = @extractTriplet(result)
    triplet.toJSON _


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
                    (user) -[upvote?:VOTED_UP] - (connection),
                    (user) -[downvote?:VOTED_DOWN] - (connection),
                    (startResourceConnections)-[?:RELATED_TO]-(startResource),
                    (endResourceConnections)-[?:RELATED_TO]-(endResource)
                  RETURN upvote, downvote, connection, startResource, endResource, startResourceCreator, endResourceCreator, connectionCreator,
                    count(connectionComments) AS connectionCommentsCount,
                    count(startResourceConnections) AS startResourceConnectionCount,
                    count(endResourceConnections) AS endResourceConnectionCount
                  ORDER BY connection.__CreatedOn__ DESC
                  LIMIT 100
                  """

    results = GraphDB.get().query(cypherQuery, null, _)
    triplets = []
    for row in results
      triplet = @extractTriplet(row)
      json = triplet.toJSON _
      triplets.push json
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
                  RETURN connection, startResource, endResource, connectionCreator, startResourceCreator, endResourceCreator, hasVotedUp, hasVotedDown,
                    count(distinct connectionComments) AS commentCount,
                    count(distinct upvotes) AS upvoteCount,
                    count(distinct downvotes) AS downvoteCount,
                    count(distinct startResourceConnections) AS startResourceConnectionCount,
                    count(distinct endResourceConnections) AS endResourceConnectionCount
                  ORDER BY connection.__CreatedOn__ DESC
                  LIMIT 20
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
      json = triplet.toJSON _
      triplets.push json
    triplets