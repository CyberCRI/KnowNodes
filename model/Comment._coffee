OwnedNodeWrapper = require './OwnedNodeWrapper'
Type = require './Type'
CommentValidator = require './validation/CommentValidator'

module.exports = class Comment extends OwnedNodeWrapper

  @getter title: ->
    @getProperty('title')

  validate: ->
    new CommentValidator().validate(@node.data)

  delete: (_) ->
    @forceDelete _
