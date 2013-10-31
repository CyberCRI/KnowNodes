module.exports =

  toJSON: (triplet, _) ->
    json = triplet.data
    json.startResource = triplet.startResource.toJSON _
    json.connection = triplet.connection.toJSON _
    json.endResource = triplet.endResource.toJSON _
    json