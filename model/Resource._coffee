OwnedNodeWrapper = require './OwnedNodeWrapper'
Type = require './Type'
ResourceValidator = require './validation/resourceValidator'
Connection = require './Connection'
Error = require '../error/Error'
User = require './User'

module.exports = class Resource extends OwnedNodeWrapper

  validate: ->
    new ResourceValidator().validate(@node.data)

  # TODO Instead of having to override the index() method,
  # TODO specifying the indexed fields of an entity should be declarative
  index: (_) ->
    super _
    if @node.data['url']?
      @indexTextProperty('url', _)