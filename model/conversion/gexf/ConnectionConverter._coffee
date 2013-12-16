escape = require('escape-html')

module.exports =



  toGEXF: (connection, _) ->
    gexf =
      _name: 'edge'
      _attrs: { id: connection.id, source: connection.startResourceId, target: connection.endResourceId }
      _content: [
        {
          _name: 'attvalues'
          _content: [
            {
              _name: 'attvalue'
              _attrs: { for: 'title', value: escape(connection.title) }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'KN_ID', value: connection.id }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'id', value: connection.id }
            }
          ]
        }
      ]
    gexf