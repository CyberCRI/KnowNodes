escape = require('escape-html')


module.exports =

  toGEXF: (resource, _) ->
    resourceCreator = resource.getCreator _
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
              _attrs: { for: 'bodyText', value: escape(resource.text) }
             }
            {
              _name: 'attvalue'
              _attrs: { for: 'KN_ID', value: resource.id }
            }
            {
              _name: 'attvalue'
              _attrs: { for: '__CreatedOn__', value: resource.creationDate }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'nodeType', value: resource.nodeType }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'id', value: resource.id }
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'creatorID', value: resourceCreator.id}
            }
            {
              _name: 'attvalue'
              _attrs: { for: 'creatorName', value: resourceCreator.fullName }
            }
          ]
        }
      ]
    gexf

