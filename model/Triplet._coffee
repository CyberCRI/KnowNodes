TripletConverter = require './conversion/TripletConverter'

module.exports = class Triplet

  constructor: (@connection, @startResource, @endResource, @data) ->
    if not @connection? or not @startResource? or not endResource? or not data?
      throw Error.illegalArgument('null', 'Triplet.constructor()')

  toJSON: (_) ->
    TripletConverter.toJSON(@, _)