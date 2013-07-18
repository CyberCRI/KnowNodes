NodeWrapper = require './NodeWrapper'
NodeType = require './NodeType'
ConnectionValidator = require './validation/connectionValidator'

module.exports = class Connection extends NodeWrapper

  ###
        CLASS METHODS
  ###

  @getNodeType: -> NodeType.CONNECTION

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

  ###
        INSTANCE METHODS
  ###

  constructor: (node) ->
    super node

  validate: ->
    new ConnectionValidator().validate(@node.data)
