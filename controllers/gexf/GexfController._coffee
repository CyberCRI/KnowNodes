Controller = require '../Controller'
parser = require 'jstoxml'

module.exports = class GexfController extends Controller

  getSampleXML: (_) ->
    json =
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
            nodes: [
              {
                _name: 'node'
                _attrs: { id: '&KN_ID', label: '&title' }
                _content: [
                  {
                    _name: 'attvalues'
                    _content: [
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'bodyText', value: '&text'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'title', value: 'title'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'KN_ID', value: 'KN_ID'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: '__CreatedOn__', value: '__CreatedOn__'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'nodeType', value: 'nodeType'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'id', value: 'id'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'creatorID', value: 'creatorID'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'creatorName', value: 'creatorName'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'connectionCount', value: 'connectionCount'}
                      }
                    ]
                  }
                ]
              }
              {
                _name: 'node'
                _attrs: { id: '&KN_ID', label: '&title' }
                _content: [
                  {
                    _name: 'attvalues'
                    _content: [
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'bodyText', value: '&text'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'title', value: 'title'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'KN_ID', value: 'KN_ID'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: '__CreatedOn__', value: '__CreatedOn__'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'nodeType', value: 'nodeType'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'id', value: 'id'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'creatorID', value: 'creatorID'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'creatorName', value: 'creatorName'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'connectionCount', value: 'connectionCount'}
                      }
                    ]
                  }
                ]
              }
            ]
            edges: [
              {
                _name: 'edge'
                _attrs: { id: '&KN_ID', source: '&startNodeId', target: '&endNodeId' }
                _content: [
                  {
                    _name: 'attvalues'
                    _content: [
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'bodyText', value: '&text'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'title', value: 'title'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'KN_ID', value: 'KN_ID'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'connectionType', value: 'connectionType'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: '__CreatedOn__', value: '__CreatedOn__'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'nodeType', value: 'nodeType'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'id', value: 'id'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'creatorID', value: 'creatorID'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'creatorName', value: 'creatorName'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'commentCount', value: 'commentCount'}
                      }
                    ]
                  }
                ]
              }
              {
                _name: 'edge'
                _attrs: { id: '&KN_ID', source: '&startNodeId', target: '&endNodeId' }
                _content: [
                  {
                    _name: 'attvalues'
                    _content: [
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'bodyText', value: '&text'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'title', value: 'title'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'KN_ID', value: 'KN_ID'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'connectionType', value: 'connectionType'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: '__CreatedOn__', value: '__CreatedOn__'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'nodeType', value: 'nodeType'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'id', value: 'id'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'creatorID', value: 'creatorID'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'creatorName', value: 'creatorName'}
                      }
                      {
                        _name: 'attvalue'
                        _attrs: {for: 'commentCount', value: 'commentCount'}
                      }
                    ]
                  }
                ]
              }
            ]
          ]
        }
      ]

    xml = parser.toXML(json, { header: true, indent: '  ' })
    xml