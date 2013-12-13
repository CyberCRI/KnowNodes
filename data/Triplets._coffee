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
      console.log triplets

    for row in incomingResults
      startResource = new Resource(row.otherResource, row.otherResourceCreator)
      endResource = new Resource(row.resource, row.resourceCreator)
      startResourceConnectionCount = row.otherResourceConnectionCount
      endResourceConnectionCount = resourceConnectionCount
      triplets.push makeTriplet(row, startResource, endResource, startResourceConnectionCount, endResourceConnectionCount)
      console.log triplets

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
                  RETURN upvote, downvote, connection, startResource, endResource, startResourceCreator, endResourceCreator, connectionCreator,
                  count(connectionComments) AS connectionCommentsCount,
                  count(startResourceConnections) AS startResourceConnectionCount,
                  count(endResourceConnections) AS endResourceConnectionCount,
                  count(distinct hasVotedUp) AS userVotedUp,
                  count(distinct hasVotedDown) AS userVotedDown
                  ORDER BY connection.__CreatedOn__ DESC
                  LIMIT 100
                  """

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

  findByResourceId2dot5: (resourceId, user, _) ->
    if user?
      userNodeId = user.node.id
    else
      userNodeId = 0

    # Pattern that matches 1st degree resources.
    # Orientation is saved for future developments, for instance, when orientation will be shown
    # with arrows. Right now, the data is here but it is not used.
    outgoingRelation =  '(resource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (otherResource)'
    incomingRelation =  '(resource) <-[:RELATED_TO]- (connection) <-[:RELATED_TO]- (otherResource)'

    # Function that produces a pattern that matches 2nd degree resources,
    # if an oriented relation such as above 'outgoingRelation'/'incomingRelation' is given as parameter.
    make2dot0Relation = (direction) ->  "(originRs) -[:RELATED_TO]- () -[:RELATED_TO]- #{direction}"

    # Patterns that match 2nd degree resources, with orientation.
    outgoing2dot0Relation = make2dot0Relation(outgoingRelation)
    incoming2dot0Relation = make2dot0Relation(incomingRelation)

    # Function that produces a pattern that matches connections between 2nd degree resources,
    # if an oriented relation such as above 'outgoingRelation'/'incomingRelation' is given as parameter.
    make2dot5Relation = (direction) -> "originRs -[:RELATED_TO*4]- #{direction} -[:RELATED_TO*4]- originRs"

    # Patterns that match relationships between 2nd degree resources, with orientation.
    incoming2dot5Relation = make2dot5Relation(incomingRelation)
    outgoing2dot5Relation = make2dot5Relation(outgoingRelation)

    # Base Cypher query, to fetch needed information.
    # parameter 'origin': the starting resource. Must take parameter 'relation' into account.
    # parameter 'relation': the relationship pattern that will be matched. Must take parameter 'origin' into account.
    # parameter 'limit': the maximum amount of results returned.
    baseQuery = (origin, relation, limit) ->  """
                                              START #{origin} = node({resourceNodeId}), user = node(#{userNodeId})
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
                                              RETURN distinct connection, connectionCreator, resource, resourceCreator, otherResource, otherResourceCreator,
                                              count(distinct comments) AS commentCount,
                                              count(distinct otherResourceConnections) AS otherResourceConnectionCount,
                                              count(distinct upvotes) AS upVoteCount,
                                              count(distinct downvotes) AS downVoteCount,
                                              count(distinct hasVotedUp) AS userVotedUp,
                                              count(distinct hasVotedDown) AS userVotedDown
                                              LIMIT #{limit}
                                              """

                                              #TODO
                                              #ORDER BY userVotedUp or other relevance criterium

    # Function that returns a Cypher query to get 1st degree resources.
    query1 = (relation) -> baseQuery("resource", relation, "8")

    # Function that returns a Cypher query to get 2nd degree resources or connections between 2nd degree resources.
    query2 = (relation) -> baseQuery("originRs", relation, "4")

    # 1st degree resources: graph 1.0
    outgoingQuery =      query1(outgoingRelation)
    incomingQuery =      query1(incomingRelation)

    # 2nd degree resources: graph 2.0
    outgoing2dot0Query = query2(outgoing2dot0Relation)
    incoming2dot0Query = query2(incoming2dot0Relation)

    # connections berween 2nd degree resources: graph 2.5
    outgoing2dot5Query = query2(outgoing2dot5Relation)
    incoming2dot5Query = query2(incoming2dot5Relation)

    resource = Resources.find(resourceId, _)
    params =
      resourceNodeId: resource.node.id
    outgoingResults =      GraphDB.get().query(outgoingQuery, params, _)
    incomingResults =      GraphDB.get().query(incomingQuery, params, _)
    outgoing2dot0Results = GraphDB.get().query(outgoing2dot0Query, params, _)
    incoming2dot0Results = GraphDB.get().query(incoming2dot0Query, params, _)
    outgoing2dot5Results = GraphDB.get().query(outgoing2dot5Query, params, _)
    incoming2dot5Results = GraphDB.get().query(incoming2dot5Query, params, _)

    resourceConnectionCount = outgoingResults.length
    + incomingResults.length      \
    + outgoing2dot0Results.length \
    + incoming2dot0Results.length \
    + outgoing2dot5Results.length \
    + incoming2dot5Results.length

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

    pushOutgoingTriplets = (set) ->
      for row in set
        startResource = new Resource(row.resource, row.resourceCreator)
        endResource = new Resource(row.otherResource, row.otherResourceCreator)
        startResourceConnectionCount = resourceConnectionCount
        endResourceConnectionCount = row.otherResourceConnectionCount
        triplets.push makeTriplet(row, startResource, endResource, startResourceConnectionCount, endResourceConnectionCount)

    pushOutgoingTriplets(outgoingResults)
    pushOutgoingTriplets(outgoing2dot0Results)
    pushOutgoingTriplets(outgoing2dot5Results)

    pushIncomingTriplets = (set) ->
      for row in set
        startResource = new Resource(row.otherResource, row.otherResourceCreator)
        endResource = new Resource(row.resource, row.resourceCreator)
        startResourceConnectionCount = row.otherResourceConnectionCount
        endResourceConnectionCount = resourceConnectionCount
        triplets.push makeTriplet(row, startResource, endResource, startResourceConnectionCount, endResourceConnectionCount)

    pushIncomingTriplets(incomingResults)
    pushIncomingTriplets(incoming2dot0Results)
    pushIncomingTriplets(incoming2dot5Results)

    triplets

  findByResourceIdFast: (resourceId, user, _) ->
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
      console.log triplets

    for row in incomingResults
      startResource = new Resource(row.otherResource, row.otherResourceCreator)
      endResource = new Resource(row.resource, row.resourceCreator)
      startResourceConnectionCount = row.otherResourceConnectionCount
      endResourceConnectionCount = resourceConnectionCount
      triplets.push makeTriplet(row, startResource, endResource, startResourceConnectionCount, endResourceConnectionCount)
      console.log triplets

    triplets