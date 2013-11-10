###
* User: Liad Magen
* Date: 16/01/13
* Time: 00:30
*
* Relation is for creating an EDGE, or a specific edge-node between two nodes in the system
###

DBModule = require './DBModule'

module.exports = class Relation extends DBModule
	constructor: (user) ->
		super user
		@currentModule = 'module/Relation'

	###
    createRelation expects two nodes (from, to) in Neo4J format ONLY
	###
	createRelation: (from, relationshipType, to, properties, _) ->
		@logger.logDebug @currentModule, 'createRelation'
		to = to.__data._node if to.__data and to.__data._node
		from = from.__data._node if from.__data and from.__data._node
		@logger.logDebug @currentModule,  'done. creating relation'

		from.createRelationshipTo to, relationshipType, properties, _
		@logger.logDebug @currentModule, 'created relation done.'

	createOwnerRelationshipToNode: (node, _) ->
		@logger.logDebug @currentModule, 'createOwnerRelationshipToNode'
		properties =
			creationDate: new Date()
		@createRelation node, 'CREATED_BY', @user, properties, _

	getOwnerRelationship: (node, _) ->
		@logger.logDebug @currentModule, 'getOwnerRelationship'
		if typeof node is 'number'
			node = @neo4jDB.getNodeById node, _
		nodes = node.getRelationshipByType node, 'CREATED_BY', _
		return if nodes.length > 0 then nodes[0] else null

	addKnownodeEdge: (fromKnownode, connectionData, toKnownode, _) ->
		@logger.logDebug @currentModule, 'addKnownodeEdge'
		#fromKnownodeId = if typeof fromKnownode is 'number' then fromKnownode else fromKnownode.id
		#toKnownodeId = if typeof toKnownode is 'number' then toKnownode else toKnownode.id
		relationshipData =
			creationDate: new Date()

		connectionData.fromNodeId = fromKnownode.id
		connectionData.toNodeId = toKnownode.id

		@logger.logDebug @currentModule, JSON.stringify connectionData

		edge = @DB.Edge.create(connectionData, _)
		@createOwnerRelationshipToNode edge

		@logger.logDebug @currentModule, 'creating relations'
		@createRelation fromKnownode, 'RELATED_TO', edge, relationshipData, _
		@createRelation edge, 'RELATED_TO', toKnownode, relationshipData, _
		return edge;