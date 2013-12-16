Controller = require '../Controller'
parser = require 'jstoxml'
Triplets = require '../../data/Triplets'
GexfRenderer = require '../../model/conversion/gexf/GexfRenderer'

module.exports = class GexfController extends Controller

  exportTriplet: (_) ->
    connectionId = @request.params.connectionId
    triplet = Triplets.findByConnectionId(connectionId, @getLoggedUserIdIfExists(), _)
    triplet.toGEXF _

  exportUserTriplets: (_) ->
    userId = @request.params.userId
    triplets = Triplets.findByUserId(userId, @getLoggedUserIdIfExists(), _)
    GexfRenderer.renderTriplets(triplets, _)

  exportResourceTriplets: (_) ->
    resourceId = @request.params.resourceId
    console.log 'requsted gexf'
    triplets = Triplets.findByResourceId2dot5(resourceId, @getLoggedUserIfExists(_), _)
    console.log 'obtained gexf'
    GexfRenderer.renderTriplets(triplets, _)