###
* User: Liad Magen
* Date: 16/01/13
* Time: 00:30
*
* Knownode module. for saving / retriving the knownodes
*
#####

BaseModule = require './baseModule'
relationModule = require('./relation')
userModule = require('./user')
knownodeFile = require('./knownodeFiles')

module.exports = class Knownode extends BaseModule
	constructor: (user) ->
		super user
		@relation = new relationModule user

	# return the related knownodes to a specific node according to the node neo4j id
	# @param nodeId the id of the original node in a numeric format (not knownodeId)
	getRelatedKnownodesToNodeId: (nodeId, _) ->
		nodes = []
		query = [
			'START firstNode=node({startNode})',
			'MATCH (firstNode) -[:RELATED_TO]- (edge) -[:RELATED_TO]- (article) -[:CREATED_BY]- (articleUser),',
			'(edge) -[:CREATED_BY]- (edgeUser) ',
			'WHERE article <> firstNode ',
			'RETURN article, articleUser, edge, edgeUser'
		].join('\n');

		params =
			startNode: nodeId

		user = new userModule

		@neo4jDB.query(query, params, _).map_(_, (_, item) ->
			#reshaping article
			articleUser = user.formatUser item.articleUser.data
			articleUser.id = item.articleUser.id
			item.article.data.id = item.article.id
			item.article.data.user = articleUser

			#reshaping connection
			connectionUser = user.formatUser item.edgeUser.data
			connectionUser.id = item.edgeUser.id
			item.edge.data.id = item.edge.data.id
			item.edge.data.user = connectionUser

			nodes.push
				article: item.article.data,
				connection: item.edge.data
		)
		return nodes;

	# return the related knownodes to a specific node according to a specific knownodeId
	# @param knownodeId - a knownode KN_ID
	getRelatedKnownodesToKnowNodeId: (knownodeId, _) ->
		node = @getKnownodeByKnownodeId knownodeId, _
		@getRelatedKnownodesToNodeId node.id, _

	getUserKnownodes: (_) ->
		query = [
			'START user=node({userId})',
			'MATCH (knownode) -[:CREATED_BY]-> (user)',
			'RETURN knownode'
		].join('\n');

		params =
			userId: @user.id,
			conceptType: @DB.getPostTypes().concept

		@neo4jDB.query query, params, _

	# return concept by knownode-Id
	getKnownodeByKnownodeId: (knownodeId, _) ->
		params = where:
			KN_ID: knownodeId
		knownode = @DB.Post.all params, _
		return if knownode.length>0 then knownode[0] else null

	# creates a new knownode from the data
	# @param knownodeData JSON data for the new node
	createNewKnownode: (knownodeData, _) ->
		knownode = @DB.Post.create knownodeData, _
		@relation.createOwnerRelationshipToNode knownode, _
		return knownode

	# creates a new knownode and connects it to another knownode
	# @param knownodeData JSON data for the new node
	createNewKnownodeWithRelation: (existingNodeId, relationData, newKnownodeData, _) ->
		knownode = @createNewKnownode newKnownodeData, _

		existingNode = @getKnownodeByKnownodeId existingNodeId, _

		# relationship direction will be just swapping between the firstNode and the new 'knownode' variable
		edge = @relation.addKnownodeEdge existingNode, relationData, knownode, _
		knownode.edge = edge
		knownode

	# destroy is delete node
	destroy: (id, _) ->
		query = [
			'START user=node({userId}), n=node({nodeId})',
			'MATCH ()-[r]-n-[:CREATED_BY]-(user)',
			'RETURN n'
		].join('\n');

		console.log 'user is' + @user.id

		params =
			userId: @user.id,
			nodeId: id

		knownode = @neo4jDB.query query, params, _

		console.log "Deleting file #{knownode.fileId}"
		kn_File = new knownodeFile @user
		kn_File.deleteFile knownode.fileId, _

		console.log "File deleted"

		query = [
			'START user=node({userId}), n=node({nodeId})',
			'MATCH ()-[r]-n-[:CREATED_BY]-(user)',
			'DELETE n'
		].join('\n');