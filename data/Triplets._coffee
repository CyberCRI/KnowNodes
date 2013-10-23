Connections = require './Connections'
Resources = require './Resources'
Users = require './Users'
Connections = require './Connections'
GraphDB = require '../DB/GraphDB'

module.exports =

  findByUserId: (userId, loggedUserId, _) ->

    nodes = []

    user = Users.find(userId, _)

    if loggedUserId?
      loggedUser = Users.find(loggedUserId, _)
    else
      loggedUser = {node: {id: 0}}

    query = """
            START connectionCreator=node({userNodeId}), user=node(#{loggedUser.node.id})
            MATCH (connection) -[:CREATED_BY]- (connectionCreator),
            (startResource) -[:RELATED_TO]- (connection) -[:RELATED_TO]-> (endResource),
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
            AND connection.nodeType = "kn_Edge"
            AND NOT(HAS(connection.status))
            RETURN connection, startResource, endResource, connectionCreator, startResourceCreator, endResourceCreator,
            count(distinct connectionComments) AS commentCount,
            count(distinct upvotes) AS upvoteCount,
            count(distinct downvotes) AS downvoteCount,
            count(distinct startResourceOtherConnections) AS startResourceOtherConnectionCount,
            count(distinct endResourceOtherConnections) AS endResourceOtherConnectionCount,
            hasVotedUp, hasVotedDown
            """
    params =
      userNodeId: user.node.id

    results = GraphDB.get().query(query, params, _)

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
      toPush.startResource.creator = item.startResourceCreator?.data
      toPush.endResource.creator = item.endResourceCreator?.data
      toPush.startResource.connectionCount = item.startResourceOtherConnectionCount
      toPush.endResource.connectionCount = item.endResourceOtherConnectionCount
      nodes.push toPush
    nodes


  findByConnectionId: (connectionId, userId, _) ->
    nodes = []

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
            """

    results = GraphDB.get().query(query, _)
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

      toPush.startResource.creator = item.startResourceCreator?.data
      toPush.endResource.creator = item.endResourceCreator?.data
      toPush.startResource.connectionCount = item.startResourceOtherConnectionCount
      toPush.endResource.connectionCount = item.endResourceOtherConnectionCount
      nodes.push toPush
    nodes
