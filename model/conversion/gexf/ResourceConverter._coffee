module.exports =

  toGEXF: (resource, _) ->
    resourceCreator = resource.getCreator _
    gexf =
      _name: 'node'
      _attrs: { id: resource.id, label: resource.title.replace(/"/g,"'") }
      _content: [
        {
          _name: 'attvalues'
          _content: [

            {
              _name: 'attvalue'
              _attrs: { for: 'title', value: resource.title.replace(/"/g,"'") }
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

