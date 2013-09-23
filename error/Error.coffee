
module.exports = class Exception

  @Type =
    BAD_REQUEST: 'BadRequest'
    UNAUTHORIZED: 'Unauthorized'
    FORBIDDEN: 'Forbidden'
    NOT_FOUND: 'NotFound'
    NOT_IMPLEMENTED: 'NotImplemented'
    ILLEGAL_ARGUMENT: 'IllegalArgument'
    UNSUPPORTED_OPERATION: 'UnsupportedOperation'

  @exception: (type, message) ->
    type: type
    message: "#{type} - #{message}"
    isCustom: true

  @badRequest: (attributeName, expected, actualValue) ->
    @exception(@Type.BAD_REQUEST, "#{attributeName} was expected to be of type #{expected}, but received #{actualValue}")

  @unauthorized: (methodName, details) ->
    @exception(@Type.UNAUTHORIZED, "#{methodName} is not allowed, you should be logged in : #{details}")

  @forbidden: (methodName, details) ->
    @exception(@Type.FORBIDDEN, "#{methodName} is forbidden (requires higher authorization level) : #{details}")

  @notFound: (nodeType, key, value) ->
    @exception(@Type.NOT_FOUND, "No #{nodeType} found for #{key} : #{value}")

  @notImplemented: (methodName) ->
    @exception(@Type.NOT_IMPLEMENTED, "You should implement method #{methodName}")

  @entityNotFound: (nodeType, id) ->
    @exception(@Type.NOT_FOUND, "No #{nodeType} found for id : #{id}")

  @illegalArgument: (argumentValue, methodName) ->
    @exception(@Type.ILLEGAL_ARGUMENT, "#{argumentValue} is not a valid value for method #{methodName}")

  @unsupportedOperation: (methodName) ->
    @exception(@Type.UNSUPPORTED_OPERATION, methodName)

  @unsupportedOperation: (methodName, reason) ->
    @exception(@Type.UNSUPPORTED_OPERATION, "#{methodName} is not supported : #{reason}")

