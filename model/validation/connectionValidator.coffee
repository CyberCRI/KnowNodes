NodeValidator = require './nodeValidator'

module.exports = class ConnectionValidator extends NodeValidator

  constructor: () ->
    super 'kn_Edge'

  validate: (data, _) ->
    console.log data
    super data
    @check(data.__CreatedOn__).notNull().isInt()
    @check(data.title).notEmpty()
    @check(data.connectionType).notEmpty()
    @check(data.fromNodeId).notEmpty()
    @check(data.toNodeId).notEmpty()
    data.active = @sanitize(data.active).toBoolean()