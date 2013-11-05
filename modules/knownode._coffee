userModule = require('./user')
DBModule = require './DBModule'

module.exports = class Knownode extends DBModule

  constructor: (user) ->
    super user
    @currentModule = 'module/Knownode'

  getRelatedKnownodesToNodeId: (nodeId, _) ->
    @logger.logDebug @currentModule, "getRelatedKnownodesToNodeId #{nodeId}"
    nodes = []
    query = [
      'START firstNode=node({startNode})',
      'MATCH (firstNode) -[:RELATED_TO]- (edge) -[:RELATED_TO]- (article) -[:CREATED_BY]- (articleUser),',
      '(edge2)-[?:RELATED_TO]-(article),',
      '(edge) -[:CREATED_BY]- (edgeUser),',
      '(edge) -[?:COMMENT_OF]- (comments)',
      'WHERE article <> firstNode AND edge2 <> edge ',
      'RETURN article, articleUser, edge, edgeUser, count(comments) AS commentCount, count(edge2) AS edgeCount'
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
        connection: item.edge.data,
        commentCount: item.commentCount,
        edgeCount: item.edgeCount

    )
    return nodes;

  getRelatedKnownodesToKnowNodeId: (knownodeId, _) ->
    @logger.logDebug @currentModule, "getRelatedKnownodesToKnowNodeId #{knownodeId}"
    node = @getKnownodeByKnownodeId knownodeId, _
    @getRelatedKnownodesToNodeId node.id, _

  getKnownodeByKnownodeId: (knownodeId, _) ->
    @logger.logDebug @currentModule, "getKnownodeByKnownodeId #{knownodeId}"
    params = where:
      KN_ID: knownodeId
    knownode = @DB.Post.all params, _
    return if knownode.length>0 then knownode[0] else null