module.exports = class NodeConverter

  @toJSON: (nodeWrapper, _) ->
    json = nodeWrapper.node.data
    json.id = nodeWrapper.id
    json