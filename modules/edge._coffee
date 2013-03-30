BaseModule = require './baseModule'
relationModule = require('./relation')
userModule = require('./user')
knownodeFile = require('./knownodeFiles')

module.exports = class Edge extends BaseModule
  constructor: (user) ->
    super user
    @relation = new relationModule user

  # return the related knownodes to a specific node according to the node neo4j id
  # @param nodeId the id of the original node in a numeric format (not knownodeId)
  getRelatedNodesToEdgeId: (edgeId, _) ->
    nodes = []
    query = [
      'START firstEdge=node(*)',
      'MATCH (edgeUser)-[:CREATED_BY]-(firstEdge) -[:RELATED_TO]-> (targetNode),',
      '(firstEdge)<-[?:RELATED_TO]-(startNode)-[?:RELATED_TO]-(otherEdge)',
      'WHERE has(firstEdge.KN_ID) and firstEdge.KN_ID = {startEdge}',
      'AND targetNode <> firstEdge AND otherEdge <> firstEdge',
      'RETURN startNode, targetNode, firstEdge, edgeUser, count(otherEdge) AS startEdgeCount'
    ].join('\n');

    params =
      "startEdge": edgeId

    user = new userModule

    queryData = @neo4jDB.query(query, params, _)
    queryData.map_(_, (_, item) ->
      console.log JSON.stringify(item)

      #reshaping article
      item.startNode.data.id = item.startNode.id
      item.startNode.data.edgeCount = item.startEdgeCount

      #reshaping connection

      edgeUser = user.formatUser item.edgeUser.data
      edgeUser.id = item.edgeUser.id
      item.firstEdge.data.id = item.firstEdge.id
      item.firstEdge.data.user = edgeUser
      item.firstEdge.data.id = item.firstEdge.id

      #reshaping targetNode

      item.targetNode.data.id = item.targetNode.id
      #item.targetNode.data.edgeCount = item.targetEdgeCount

      nodes.push
        article: item.startNode.data
        connection: item.firstEdge.data
        targetArticle: item.targetNode.data

    )

    nodes