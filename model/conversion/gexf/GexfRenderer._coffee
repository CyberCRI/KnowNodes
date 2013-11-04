ResourceConverter = require './ResourceConverter'
ConnectionConverter = require './ConnectionConverter'

module.exports =

  renderTriplets: (triplets, _) ->
    resources = []
    connections = []
    for triplet in triplets
      resources.push triplet.startResource
      resources.push triplet.endResource
      connections.push triplet.connection
    @render(resources, connections, _)

  render: (resources, connections, _) ->

    nodes = []
    for resource in resources
      nodes.push ResourceConverter.toGEXF(resource, _)

    edges = []
    for connection in connections
      edges.push ConnectionConverter.toGEXF(connection, _)

    gexf =
      _name: 'gexf'
      _attrs: { xmlns: 'http://www.gexf.net/1.2draft', version: '1.2' }
      _content: [
        meta:
          creator: 'KnowNodes'
          description: 'Exported Graph'
        {
          _name: 'graph'
          _attrs: { defaultedgetype: 'directed', mode: 'dynamic'}
          _content: [
            {
              _name: 'attributes'
              _attrs:  {class: 'node', mode: 'static'}
              _content: [
                {
                  _name: 'attribute'
                  _attrs: {id: 'bodyText', title: 'bodyText', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'title', title: 'title', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'KN_ID', title: 'KN_ID', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: '__CreatedOn__', title: '__CreatedOn__', type: 'long'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'nodeType', title: 'nodeType', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'id', title: 'id', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'creatorID', title: 'creatorID', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'creatorName', title: 'creatorName', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'connectionCount', title: 'connectionCount', type: 'integer'}
                }
              ]
            }
            {
              _name: 'attributes'
              _attrs:  {class: 'edge', mode: 'static'}
              _content: [
                {
                  _name: 'attribute'
                  _attrs: {id: 'bodyText', title: 'bodyText', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'title', title: 'title', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'connectionType', title: 'connectionType', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'KN_ID', title: 'KN_ID', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: '__CreatedOn__', title: '__CreatedOn__', type: 'long'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'nodeType', title: 'nodeType', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'id', title: 'id', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'creatorID', title: 'creatorID', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'creatorName', title: 'creatorName', type: 'string'}
                }
                {
                  _name: 'attribute'
                  _attrs: {id: 'commentCount', title: 'commentCount', type: 'integer'}
                }
              ]
            }
            nodes: nodes
            edges: edges
          ]
        }
      ]

    gexf