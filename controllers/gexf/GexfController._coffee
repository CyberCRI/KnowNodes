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
    triplets = Triplets.findByResourceId(resourceId, @getLoggedUserIfExists(_), _)
    GexfRenderer.renderTriplets(triplets, _)