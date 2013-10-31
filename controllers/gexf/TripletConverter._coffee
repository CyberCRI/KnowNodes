GexfFactory = require './GexfFactory'

module.exports =

  toGexfFormat: (triplet, _) ->

    resources = [triplet.startResource, triplet.endResource]
    connections = [triplet.connection]

    GexfFactory.render(resources, connections, _)



