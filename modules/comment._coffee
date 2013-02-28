###
* User: Liad Magen
* Date: 05/02/13
* Time: 12:43
*
* comments module. for adding / editing the comments of knownodes and relations
*
#####
BaseModule = require './baseModule'
relationModule = require('./relation')
userModule = require('./user')

module.exports = class Comment extends BaseModule
	constructor: (user) ->
		super user
		@relation = new relationModule user

	queryAndFormatCommentResults: (query, queryParams, _) ->
		user = new userModule
		comments = []

		@neo4jDB.query(query, queryParams, _).map_(_, (_, item) ->
			commentUser = user.formatUser item.commentUser.data
			commentUser.id = item.commentUser.id
			item.comment.data.id = item.comment.id
			item.comment.data.user = commentUser
			comments.push item.comment.data
		)

		comments

	# return all comments for a specific node according to its neo4j node id
	# @param nodeId - a node id number (in neo4j)
	getAllComments: (nodeId, _) ->
		query = [
			'START root=node({nodeId})',
			'MATCH (root) <-[r:COMMENT_OF*]- (comment) -[u:CREATED_BY]-> (commentUser)',
			'RETURN comment, r, commentUser'
		].join('\n');

		params =
			nodeId: nodeId

		@queryAndFormatCommentResults query, params, _

	getAllCommentsOfKnownodeID: (knownodeId, _) ->
		queryParams = 'KN_ID' : knownodeId

		query = [
			'START root=node(*) ',
			'MATCH (root) <-[r:COMMENT_OF*]- (comment) -[u:CREATED_BY]-> (commentUser)',
			'WHERE root.KN_ID = {KN_ID} '
			'RETURN comment, r, commentUser'
		].join('\n');

		@queryAndFormatCommentResults query, queryParams, _

	# creating a new comment on a specific node
	# @param commentData the json object with the comment details, according to the db structure
	# @param commentedOnNode the node to relate the comment to
	createNewComment: (commentData, commentedObjectId, _) =>
		comment = @DB.Comment.create commentData, _
		@relation.createOwnerRelationshipToNode comment

		properties =
			creationDate: new Date()
		commentedObject = @neo4jDB.query "START node=node(*) WHERE node.KN_ID='#{commentedObjectId}' RETURN node", _
		@relation.createRelation comment, 'COMMENT_OF', commentedObject[0].node, properties, _

		comment

	createNewCommentToObjectId: (commentData, commentedObjectId, _) ->
		queryParams = where :
			'KN_ID' : commentedObjectId

		commentedObject = @neo4jDB.getNodeById commentedObjectId, _

		@createNewComment commentData, commentedObject, _