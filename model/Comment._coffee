OwnedNodeWrapper = require './OwnedNodeWrapper'
Type = require './Type'
CommentValidator = require './validation/CommentValidator'
OwnedNodeConverter = require './conversion/OwnedNodeConverter'

module.exports = class Comment extends OwnedNodeWrapper

  @getter text: ->
    @getProperty('bodyText')

  validate: ->
    new CommentValidator().validate(@node.data)

  delete: (_) ->
    @forceDelete _

  getConverter: ->
    OwnedNodeConverter
