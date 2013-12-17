escape = require('escape-html')


module.exports =

  toGEXF: (resource, _) ->
    gexf =
      _name: 'node'
      _attrs: { id: resource.id, label: escape(resource.title) }
      _content: [
        {
          _name: 'attvalues'
          _content: [

            {
              _name: 'attvalue'
              _attrs: { for: 'title', value: escape(resource.title) }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'KN_ID', value: resource.id }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'id', value: resource.id }
            }
          ]
        }
      ]
    gexf

