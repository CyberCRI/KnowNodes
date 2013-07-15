Validator = require 'validator'

module.exports = class NodeValidator

  constructor: (nodeType) ->
    @nodeType = nodeType
    @check = Validator.check
    @sanitize = Validator.sanitize

  validate: (data, _) ->
    @check(data.KN_ID).notEmpty()
    @check(data.nodeType).notNull().equals(@nodeType)