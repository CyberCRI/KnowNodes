GraphElement = require './graphElement'

module.exports = class Edge extends GraphElement

  constructor: (user) ->
    super("graph/edge", user)

  create: (from, relationshipType, to, properties, _) ->
    @logger.debug 'createRelation'
    to = to.__data._node if to.__data and to.__data._node
    from = from.__data._node if from.__data and from.__data._node
    from.createRelationshipTo(to, relationshipType, properties, _)

  addCreatedByRelationship: (node, _) ->
    @logger.debug 'addCreatedByRelationship'
    properties = {creationDate: new Date()}
    @create(node, 'CREATED_BY', @user, properties, _)