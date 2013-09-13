
module.exports = class Exception

  @Type =
    NOT_IMPLEMENTED: 'NotImplemented'
    NOT_FOUND: 'NotFound'
    ILLEGAL_ARGUMENT: 'IllegalArgument'
    UNSUPPORTED_OPERATION: 'UnsupportedOperation'
    UNAUTHORIZED: 'Unauthorized'
    FORBIDDEN: 'Forbidden'

  @exception: (type, message) ->
    type: type
    message: "#{type} - #{message}"
    isCustom: true

  @notImplemented: (methodName) ->
    @exception(@Type.NOT_IMPLEMENTED, "You should implement method #{methodName}")

  @entityNotFound: (nodeType, id) ->
    @exception(@Type.NOT_FOUND, "No #{nodeType} found for id : #{id}")

  @notFound: (nodeType, key, value) ->
    @exception(@Type.NOT_FOUND, "No #{nodeType} found for #{key} : #{value}")

  @illegalArgument: (argumentValue, methodName) ->
    @exception(@Type.ILLEGAL_ARGUMENT, "#{argumentValue} is not a valid value for method #{methodName}")

  @unsupportedOperation: (methodName) ->
    @exception(@Type.UNSUPPORTED_OPERATION, methodName)

  @unsupportedOperation: (methodName, reason) ->
    @exception(@Type.UNSUPPORTED_OPERATION, "#{methodName} is not supported : #{reason}")

  @unauthorized: (methodName, details) ->
    @exception(@Type.UNAUTHORIZED, "#{methodName} is not allowed, you should be logged in : #{details}")

  @forbidden: (methodName, details) ->
    @exception(@Type.FORBIDDEN, "#{methodName} is forbidden (requires higher authorization level) : #{details}")
