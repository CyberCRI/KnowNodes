toJSON = (triplet, _) ->
  json = {}
  json.startResource = triplet.startResource.toJSON _
  json.connections = []
  for connection in triplet.connections
    json.connections.push connection.toJSON _
  json.endResource = triplet.endResource.toJSON _
  json

module.exports =

  convertArray: (triplets, _) ->
    jsonArray = []
    for triplet in triplets
      json =
        hasJsonConverter: (_) -> true
        toJSON: (_) -> toJSON(triplet, _)
      jsonArray.push json
    jsonArray