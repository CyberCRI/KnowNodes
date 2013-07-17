NodeWrapper = require './NodeWrapper'
ResourceValidator = require './validation/resourceValidator'
Connection = require './Connection'
Error = require '../error/Error'

module.exports = class Resource extends NodeWrapper

  ###
        CLASS METHODS
  ###

  @getNodeType: -> 'kn_Post'

  @wrap: (node) -> new Resource(node)

  # Overrides parent method to make sure the resource has a CREATED_BY relationship
  @create: (data, creator, _) ->
    data.active = true
    created = super(data, _)
    creator.setAsCreator(created, _)
    return created

  @searchByKeyword: (userQuery, _) ->
    @logger.debug("searchByKeyword (query: #{userQuery})")
    nodes = []
    cypherQuery = [
      'START results=node(*)',
      'Where has(results.title)',
      'and results.nodeType="kn_Post"',
      'and results.title =~ {userQuery}',
      'RETURN results'
    ].join('\n');
    userQuery = '(?i).*' + userQuery + '.*'
    params =
      userQuery: userQuery

    @getDB().query(cypherQuery, params, _).map_(_, (_, item) ->
      item.results.data.id = item.results.id
      nodes.push
        results: item.results.data
    )
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
