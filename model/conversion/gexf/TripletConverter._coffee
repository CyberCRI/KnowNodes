GexfRenderer = require './GexfRenderer'

module.exports =

  toGEXF: (triplet, _) ->
    resources = [triplet.startResource, triplet.endResource]
    connections = [triplet.connection]
    GexfRenderer.render(resources, connections, _)
