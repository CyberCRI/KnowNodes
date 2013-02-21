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
			'MATCH (root) <-[r:COMMENT_OF*]- (comment)',
			'RETURN comment, r'
		].join('\n');

		params =
			nodeId: nodeId,
			conceptType: @DB.getPostTypes().concept

		@neo4jDB.query query, params, _

	# creating a new comment on a specific node
	# @param commentData the json object with the comment details, according to the db structure
	# @param commentedOnNode the node to relate the comment to
	createNewComment: (commentData, commentedObject, _) ->
		comment = @DB.Comment.create commentData, _
		@relation.createOwnerRelationshipToNode comment

		properties =
			creationDate: new Date()
		@relation.createRelation comment, 'COMMENT_OF', commentedObject, properties, _

		comment

	createNewCommentToObjectId: (commentData, commentedObjectId, _) ->
		queryParams = where :
			'KN_ID' : commentedObjectId

		commentedObject = @neo4jDB.getNodeById commentedObjectId, _

		@createNewComment commentData, commentedObject, _