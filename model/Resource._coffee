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
      user = {}
      user.node = {}
      user.node.id = 0

    query = [
      "START resource=node({resourceNodeId}), user=node(#{user.node.id})",
      "MATCH (resource) -[:RELATED_TO]- (connection) -[:RELATED_TO]- (endResource) -[:CREATED_BY]- (endResourceCreator),",
      "(otherConnections)-[?:RELATED_TO]-(endResource),",
      "(connection) -[?:VOTED_UP]- (upvotes),",
      "(downvotes) -[?:VOTED_DOWN]- (connection),",
      "(connection) -[:CREATED_BY]- (connectionCreator),",
      "(user) -[hasVotedUp?:VOTED_UP]-> (connection),",
      "(user) -[hasVotedDown?:VOTED_DOWN]-> (connection),",
      "(connection) -[?:COMMENT_OF]- (comments)",
      "WHERE endResource <> resource ",
      "AND otherConnections <> connection",
      "RETURN resource, endResource, endResourceCreator, connection, connectionCreator,",
      "count(distinct comments) AS commentCount,",
      "count(distinct otherConnections) AS endResourceConnectionCount, ",
      "count(distinct connection)-1 AS startResourceConnectionCount, ",
      "count(distinct upvotes) AS upVoteCount,",
      "count(distinct downvotes) AS downVoteCount,",
      "hasVotedUp, hasVotedDown"
    ].join('\n');
    resource = @find(id, _)
    params =
      resourceNodeId: resource.node.id

    results = @DB.query(query, params, _)
    for item in results
      toPush =
        upvotes: item.upVoteCount,
        downvotes: item.downVoteCount,
        userUpvoted: item.hasVotedUp,
        userDownvoted: item.hasVotedDown,
        startResource: item.resource.data,
        endResource: item.endResource.data,
        connection: item.connection.data,
        commentCount: item.commentCount,
      toPush.startResource.connectionCount = item.startResourceConnectionCount
      toPush.endResource.connectionCount = item.endResourceConnectionCount
      toPush.endResource.creator = item.endResourceCreator.data
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