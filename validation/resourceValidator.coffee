NodeValidator = require './nodeValidator'

module.exports = class ResourceValidator extends NodeValidator

  constructor: () ->
    super 'kn_Post'

  validate: (data, _) ->
    super data
    @check(data.__CreatedOn__).notNull().isInt()
    @check(data.title).notEmpty()
    data.active = @sanitize(data.active).toBoolean()