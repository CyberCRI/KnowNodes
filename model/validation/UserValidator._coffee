NodeValidator = require './nodeValidator'
Type = require '../Type'

module.exports = class UserValidator extends NodeValidator

  constructor: () ->
    super Type.USER

  validate: (data, _) ->
    super data
    @check(data.__CreatedOn__).notNull().isInt()
    @check(data.email).notEmpty()
    @check(data.password).notEmpty()