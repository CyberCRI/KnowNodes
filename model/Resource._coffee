OwnedNodeWrapper = require './OwnedNodeWrapper'
Type = require './Type'
ResourceValidator = require './validation/ResourceValidator'
JsonConverter = require './conversion/json/OwnedNodeConverter'
GexfConverter = require './conversion/gexf/ResourceConverter'
Connection = require './Connection'
Error = require '../error/Error'
User = require './User'

module.exports = class Resource extends OwnedNodeWrapper

  @getter title: ->
    @getProperty('title')

  @getter bodyText: ->
    @getProperty('bodyText')

  validate: ->
    new ResourceValidator().validate(@node.data)

  getJsonConverter: ->
    JsonConverter

  hasGexfConverter: -> true

  toGEXF: (_) ->
    GexfConverter.toGEXF(@, _)

  # TODO Instead of having to override the index() method,
  # TODO specifying the indexed fields of an entity should be declarative
  index: (_) ->
    super _
    if @node.data['url']?
      @indexTextProperty('url', _)