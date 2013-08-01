NodeWrapper = require './NodeWrapper'
Type = require './Type'
ResourceValidator = require './validation/resourceValidator'
Connection = require './Connection'
Error = require '../error/Error'
User = require './User'

module.exports = class Resource extends NodeWrapper

  ###
        CLASS METHODS
  ###

  @getNodeType: -> Type.RESOURCE

  @wrap: (node) -> new Resource(node)

  # Overrides parent method to make sure the resource has a CREATED_BY relationship
  @create: (data, creator, _) ->
    data.active = true
    created = super(data, _)
    creator.setAsCreator(created, _)
    return created

  @searchByKeyword: (userQuery, _) ->
    nodes = []
    cypherQuery = [
      'START results=node(*)',
      'Where has(results.title)',
      'and results.nodeType="kn_Post"',
      'and results.title =~ {regex}',
      'RETURN results'
    ].join('\n');
    regex = '(?i).*' + userQuery + '.*'
    params = {regex: regex}
    results = @DB.query(cypherQuery, params, _)
    for item in results
      nodes.push item.results.data
    nodes

  @findByUrl: (url, _) ->
    @findByTextProperty('url', url, _)

  @findTripletsByResourceId: (id, user, _) ->
    nodes = []

    if user == "no user"

      query = [
        "START resource=node({resourceNodeId})",
        "MATCH (resource) -[:RELATED_TO]- (connection) -[:RELATED_TO]- (otherResource) -[:CREATED_BY]- (endResourceCreator),",
        "(otherConnections)-[?:RELATED_TO]-(otherResource),",
        "(connection) -[?:VOTED_UP]- (upvotes),",
        "(downvotes) -[?:VOTED_DOWN]- (connection),",
        "(connection) -[:CREATED_BY]- (connectionCreator),",
        "(connection) -[?:COMMENT_OF]- (comments)",
        "WHERE otherResource <> resource ",
        "AND otherConnections <> connection ",
        "RETURN resource, otherResource, connection, endResourceCreator, connectionCreator, count(comments) AS commentCount, count(otherConnections) AS otherConnectionsCount, ",
        "count(distinct upvotes) AS upVoteCount,",
        "count(distinct downvotes) AS downVoteCount"
      ].join('\n');
      resource = @find(id, _)
      params =
        resourceNodeId: resource.node.id

      results = @DB.query(query, params, _)

      for item in results
        toPush =
          upvotes: item.upVoteCount,
          downvotes: item.downVoteCount,
          startResource: item.resource.data,
          endResource: item.otherResource.data,
          connection: item.connection.data,
          commentCount: item.commentCount,
          otherConnectionsCount: item.otherConnectionsCount
        toPush.endResource.creator = item.endResourceCreator.data
        toPush.connection.creator = item.connectionCreator.data
        nodes.push toPush
      nodes

    else
      query = [
        "START resource=node({resourceNodeId}), user=node(#{user.node.id})",
        "MATCH (resource) -[:RELATED_TO]- (connection) -[:RELATED_TO]- (otherResource) -[:CREATED_BY]- (otherResourceCreator),",
        "(otherConnections)-[?:RELATED_TO]-(otherResource),",
        "(connection) -[?:VOTED_UP]- (upvotes),",
        "(downvotes) -[?:VOTED_DOWN]- (connection),",
        "(connection) -[:CREATED_BY]- (connectionCreator),",
        "(user) -[hasVotedUp?:VOTED_UP]-> (connection),",
        "(user) -[hasVotedDown?:VOTED_DOWN]-> (connection),",
        "(connection) -[?:COMMENT_OF]- (comments)",
        "WHERE otherResource <> resource ",
        "AND otherConnections <> connection",
        "RETURN resource, otherResource, otherResourceCreator, connection, connectionCreator, count(comments) AS commentCount, count(otherConnections) AS otherConnectionsCount, ",
        "count(distinct upvotes) AS upVoteCount,",
        "count(distinct downvotes) AS downVoteCount,",
        "hasVotedUp, hasVotedDown"
      ].join('\n');
      console.log("cypher query done")
      resource = @find(id, _)
      params =
        resourceNodeId: resource.node.id

      results = @DB.query(query, params, _)
      for item in results
        toPush =
          upvotes: item.upVoteCount,
          downvotes: item.downVoteCount,
          upvoted: item.hasVotedUp,
          downvoted: item.hasVotedDown,
          startResource: item.resource.data,
          endResource: item.otherResource.data,
          connection: item.connection.data,
          commentCount: item.commentCount,
          otherConnectionsCount: item.otherConnectionsCount
        toPush.endResource.creator = item.otherResourceCreator.data
        toPush.connection.creator = item.connectionCreator.data
        nodes.push toPush
      nodes

  ###
        INSTANCE METHODS
  ###

  constructor: (node) ->
    super node

  connectTo: (other, user, data, _) ->
    Connection.connect(@, other, user, data, _)

  validate: ->
    new ResourceValidator().validate(@node.data)

  index: (_) ->
    super _
    if @node.data['url']?
      @indexTextProperty('url', _)