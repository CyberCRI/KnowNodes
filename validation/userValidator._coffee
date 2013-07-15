NodeValidator = require './nodeValidator'

module.exports = class UserValidator extends NodeValidator

  constructor: () ->
    super 'kn_User'

  validate: (data, _) ->
    super data
    @check(data.__CreatedOn__).notNull().isInt()