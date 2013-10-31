module.exports =

  toGexfFormat: (connection, _) ->
    connectionCreator = connection.getCreator _
    gexf =
      _name: 'edge'
      _attrs: { id: connection.id, source: connection.startNodeId, target: connection.endNodeId }
      _content: [
        {
          _name: 'attvalues'
          _content: [
            {
              _name: 'attvalue'
              _attrs: { for: 'bodyText', value: connection.text }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'title', value: connection.title }
            }
            {
              _name: 'attvalue'
              _attrs: {for: 'connectionType', value: connection.connectionType}
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'KN_ID', value: connection.id }
            }
            {
              _name: 'attvalue'
              _attrs: { for: '__CreatedOn__', value: connection.creationDate }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'nodeType', value: connection.nodeType }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'id', value: connection.id }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'creatorID', value: connectionCreator.id}
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'creatorName', value: connectionCreator.fullName }
            }
          ]
        }
      ]
    gexf