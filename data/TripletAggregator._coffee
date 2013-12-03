makeHash = (triplet) ->
  startId = triplet.startResource.id
  endId = triplet.endResource.id
  hash
  if startId < endId
    hash = startId + '->' + endId
  else
    hash = endId + '->' + startId
  hash

aggregate = (triplet) ->
  startResource: triplet.startResource
  connections: [
    triplet.connection
  ]
  endResource: triplet.endResource

module.exports =

  aggregate: (triplets) ->

    unless triplets?.length? and triplets.length > 0
      triplets

    else

      hashes = []
      hashMap = {}
      aggregates = []

      for triplet in triplets
        hash = makeHash(triplet)
        # Parallel connections have identical hashes
        if hash in hashes
          # Parallel connection found
          aggregated = hashMap[hash]
          aggregated.connections.push triplet.connection
        else
          # Not a parallel connection, add it as usual
          hashes.push hash
          aggregated = aggregate triplet
          hashMap[hash] = aggregated
          aggregates.push aggregated

      aggregates