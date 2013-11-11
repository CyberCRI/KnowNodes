NodeValidator = require './NodeValidator'
Type = require '../Type'

module.exports = class ConnectionValidator extends NodeValidator

  constructor: () ->
    super Type.CONNECTION

  validate: (data, _) ->
    super data
    @check(data.__CreatedOn__).notNull().isInt()
    @check(data.title).notEmpty()
    @check(data.connectionType).notEmpty()
    @check(data.fromNodeId).notEmpty()
    @check(data.toNodeId).notEmpty()
    @check(data.fromNodeId).not(data.toNodeId)
    data.active = @sanitize(data.active).toBoolean()