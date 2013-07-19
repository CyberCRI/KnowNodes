NodeWrapper = require './NodeWrapper'
NodeType = require './NodeType'
ResourceValidator = require './validation/resourceValidator'
Connection = require './Connection'
Error = require '../error/Error'

module.exports = class Resource extends NodeWrapper

  @Type:
    WIKIPEDIA_ARTICLE: 'Wikipedia Article'

  ###
        CLASS METHODS
  ###

  @getNodeType: -> NodeType.RESOURCE

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
    @DB.query(cypherQuery, params, _).map_(_, (_, item) ->
      item.results.data.id = item.results.id
      nodes.push(item.results.data)
    )
    nodes

  @findByUrl: (url, _) ->
    @findByTextProperty('url', url, _)

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