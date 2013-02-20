###
* User: Liad Magen
* Date: 16/01/13
* Time: 00:30
*
* Relation is for creating an EDGE, or a specific edge-node between two nodes in the system
###

BaseModule = require './baseModule'

module.exports = class Relation extends BaseModule
	constructor: (user) ->
		super user

	###
    createRelation expects two nodes (from, to) in Neo4J format ONLY
	###
	createRelation: (from, relationshipType, to, properties, _) ->
		console.log 'in createRelation. Extracting the Neo4J node'
		to = to.__data._node if to.__data and to.__data._node
		from = from.__data._node if from.__data and from.__data._node
		console.log 'done. creating relation'

		from.createRelationshipTo to, relationshipType, properties, _
		console.log 'created relation done.'

	createOwnerRelationshipToNode: (node, _) ->
		console.log 'createOwnerRelationshipToNode: user is ' + @user.id
		properties =
			creationDate: new Date()
		@createRelation node, 'CREATED_BY', @user, properties, _

	getOwnerRelationship: (node, _) ->
		if typeof node is 'number'
			node = @neo4jDB.getNodeById node, _
		nodes = node.getRelationshipByType node, 'CREATED_BY', _
		return if nodes.length > 0 then nodes[0] else null

	addKnownodeEdge: (fromKnownode, connectionData, toKnownode, _) ->
		#fromKnownodeId = if typeof fromKnownode is 'number' then fromKnownode else fromKnownode.id
		#toKnownodeId = if typeof toKnownode is 'number' then toKnownode else toKnownode.id
		console.log 'in addKnownodeEdge'
		relationshipData =
			creationDate: new Date()

		connectionData.fromNodeId = fromKnownode.id
		connectionData.toNodeId = toKnownode.id

		console.log JSON.stringify connectionData

		edge = @DB.Edge.create(connectionData, _)
		@createOwnerRelationshipToNode edge

		console.log 'creating relations'
		@createRelation fromKnownode, 'RELATED_TO', edge, relationshipData, _
		@createRelation edge, 'RELATED_TO', toKnownode, relationshipData, _
		return edge;