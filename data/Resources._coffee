OwnedEntities = require './OwnedEntities'
Type = require './../model/Type'
ResourceValidator = require './../model/validation/ResourceValidator'
Resource = require './../model/Resource'
Connection = require './../model/Connection'
Error = require '../error/Error'
User = require './../model/User'

module.exports = class Resources extends OwnedEntities

  @getNodeType: -> Type.RESOURCE

  @wrap: (node) -> new Resource(node)

  @searchByKeyword: (userQuery, _) ->
    nodes = []
    cypherQuery = """
                  START results=node(*)
                  Where has(results.title)
                  and results.nodeType="kn_Post"
                  and results.title =~ {regex}
                  RETURN results
                  """
    regex = '(?i).*' + userQuery + '.*'
    params = {regex: regex}
    results = @DB.query(cypherQuery, params, _)
    for item in results
      nodes.push item.results.data
    nodes

  @findByUrl: (url, _) ->
    @findByTextProperty('url', url, _)