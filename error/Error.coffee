
module.exports = class Exception

  @Type =
    NOT_IMPLEMENTED: 'NotImplemented'
    ENTITY_NOT_FOUND: 'EntityNotFound'
    ILLEGAL_ARGUMENT: 'IllegalArgument'
    UNSUPPORTED_OPERATION: 'UnsupportedOperation'

  @exception: (type, message) ->
    type: type
    message: "#{type} - #{message}"
    isCustom: true

  @notImplemented: (methodName) ->
    @exception(@Type.NOT_IMPLEMENTED, "You should implement method #{methodName}")

  @entityNotFound: (nodeType, id) ->
    @exception(@Type.ENTITY_NOT_FOUND, "No #{nodeType} found for id : #{id}")

  @illegalArgument: (argumentValue, methodName) ->
    @exception(@Type.ILLEGAL_ARGUMENT, "#{argumentValue} is not a valid value for method #{methodName}")

  @unsupportedOperation: (methodName) ->
    @exception(@Type.UNSUPPORTED_OPERATION, methodName)

  @unsupportedOperation: (methodName, reason) ->
    @exception(@Type.UNSUPPORTED_OPERATION, "#{methodName} is not supported : #{reason}")