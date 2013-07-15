DB = require './DB'
Logger = require '../log/logger'

module.exports = class EdgeDB extends DB

  constructor: (@user) ->
    super
    @logger = new Logger("graph/edgeDB", @user)

  create: (from, relationshipType, to, properties, _) ->
    @logger.debug 'create'
    #    console.log('from : ', from)
    #    console.log('relationshipType : ', relationshipType)
    #    console.log('to : ', to)
    #    console.log('properties : ', properties)
    #    to = to.__data._node if to.__data and to.__data._node
    #    from = from.__data._node if from.__data and from.__data._node
    from.createRelationshipTo(to, relationshipType, properties, _)

  addCreatedByRelationship: (node, userNode, _) ->
    @logger.debug 'addCreatedByRelationship'
    properties = {creationDate: new Date()}
    @create(node, 'CREATED_BY', userNode, properties, _)

  addResourceToConnectionRelationship: (resource, connection, _) ->
    @logger.debug 'addResourceToConnectionRelationship'
    relationshipData =
      creationDate: new Date()
    @create resource, 'RELATED_TO', connection, relationshipData, _

  addConnectionToResourceRelationship: (connection, resource, _) ->
    @logger.debug 'addConnectionToResourceRelationship'
    relationshipData =
      creationDate: new Date()
    @create connection, 'RELATED_TO', resource, relationshipData, _