JsonConverter = require './conversion/json/TripletConverter'
GexfConverter = require './conversion/gexf/TripletConverter'

module.exports = class Triplet

  constructor: (@connection, @startResource, @endResource, @data) ->
    if not @connection? or not @startResource? or not endResource? or not data?
      throw Error.illegalArgument('null', 'Triplet.constructor()')

  hasJsonConverter: -> true

  toJSON: (_) ->
    JsonConverter.toJSON(@, _)

  hasGexfConverter: -> true

  toGEXF: (_) ->
    GexfConverter.toGEXF(@, _)