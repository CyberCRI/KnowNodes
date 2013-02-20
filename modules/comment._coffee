###
* User: Liad Magen
* Date: 05/02/13
* Time: 12:43
*
* comments module. for adding / editing the comments of knownodes and relations
*
#####
BaseModule = require './baseModule'

module.exports = class Comment extends BaseModule
	constructor: (user) ->
		super user

	# return all comments for a specific node according to its neo4j node id
	# @param nodeId - a node id number (in neo4j)
	getAllComments: (nodeId, _) ->
		query = [
			'START root=node({nodeId})',
			'MATCH (comment) -[:COMMENT_OF]-> (root)',
			'RETURN knownode'
		].join('\n');

		params =
			nodeId: nodeId,
			conceptType: @DB.getPostTypes().concept

		@neo4jDB.query query, params, _

	# creating a new comment on a specific node
	# @param commentData the json object with the comment details, according to the db structure
	# @param commentedOnNode the node to relate the comment to
	createNewComment: (commentData, commentedOnNode, _) ->
		comment = @DB.Comment.create commentData, _
		@relation.createOwnerRelationship comment
		properties =
			creationDate: new Date()
		commentedOnNode.createRelationshipTo commentedOnNode, comment, 'COMMENT_OF', properties, _
		return comment
