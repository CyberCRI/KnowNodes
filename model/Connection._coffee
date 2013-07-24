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
    data.active = true
    created = super(data, _)
    creator.setAsCreator(created, _)
    return created

  @connect: (startResource, endResource, user, data, _) ->
    relationshipData =
      creationDate: new Date()
    connection = @create(data, user, _)
    startResource.node.createRelationshipTo(connection.node, 'RELATED_TO', relationshipData, _)
    connection.node.createRelationshipTo(endResource.node, 'RELATED_TO', relationshipData, _)
    return connection

  @latestTriplets: (_) ->
    now = Date.now()
    aWeekAgo = now - 1000 * 60 * 60 * 24 * 7 # Seven days
    luceneQuery = "__CreatedOn__:[#{aWeekAgo} TO #{now}]"

    cypherQuery = [
      "START connection=node:kn_Edge('#{luceneQuery}')",
      "MATCH (startResource) -[:RELATED_TO]-> (connection) -[:RELATED_TO]-> (endResource),",
      "(connection) -[:CREATED_BY]- (connectionCreator),",
      "(startResource) -[:CREATED_BY]- (startResourceCreator),",
      "(endResource) -[:CREATED_BY]- (endResourceCreator),",
      "(connection) -[?:COMMENT_OF]- (connectionComments),",
      "(startResourceOtherConnections)-[?:RELATED_TO]-(startResource),",
      "(endResourceOtherConnections)-[?:RELATED_TO]-(endResource)",
      "WHERE startResource <> endResource",
      "AND startResourceOtherConnections <> connection",
      "AND endResourceOtherConnections <> connection",
      "RETURN connection, startResource, endResource, connectionCreator, startResourceCreator, endResourceCreator, connectionCreator,",
      "count(connectionComments) AS connectionCommentsCount,",
      "count(startResourceOtherConnections) AS startResourceOtherConnectionsCount,",
      "count(endResourceOtherConnections) AS endResourceOtherConnectionsCount",
      "ORDER BY connection.__CreatedOn__ DESC",
      "LIMIT 100"
    ].join('\n');

    results = @DB.query(cypherQuery, null, _)
    nodes = []
    for item in results
      toPush =
        connection: item.connection.data,
        startResource: item.startResource.data,
        endResource: item.startResource.data,
      toPush.connection.commentCount = item.connectionCommentsCounts
      toPush.connection.creator = item.connectionCreator.data
      toPush.startResource.creator = item.startResourceCreator.data
      toPush.endResource.creator = item.endResource.data
      toPush.startResource.otherConnectionsCount = item.startResourceOtherConnectionsCount
      toPush.endResource.otherConnectionsCount = item.endResourceOtherConnectionsCount
      nodes.push toPush
    nodes

  ###
        INSTANCE METHODS
  ###

  constructor: (node) ->
    super node

  validate: ->
    new ConnectionValidator().validate(@node.data)