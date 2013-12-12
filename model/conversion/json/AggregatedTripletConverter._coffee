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
    elementArray = []
    jsonArray = []
    i = 0
    while i < triplets.length
      triplet = triplets[i]
      json = toJSON(triplet, _)
      jsonArray[i] = json
      element =
        jsonArrayIndex: i
        hasJsonConverter: (_) -> true
        toJSON: (_) -> jsonArray[@jsonArrayIndex]
      elementArray[i] = element
      i++
    elementArray