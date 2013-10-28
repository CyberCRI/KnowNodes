NodeValidator = require './NodeValidator'
Type = require '../Type'

module.exports = class CommentValidatorValidator extends NodeValidator

  constructor: () ->
    super Type.COMMENT

  validate: (data, _) ->
    super data
    @check(data.__CreatedOn__).notNull().isInt()
    @check(data.bodyText).notEmpty()
    @check(data.connectionId).notEmpty()
    data.active = @sanitize(data.active).toBoolean()