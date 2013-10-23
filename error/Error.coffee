
module.exports =

  Type:
    BAD_REQUEST: 'BadRequest'
    UNAUTHORIZED: 'Unauthorized'
    FORBIDDEN: 'Forbidden'
    NOT_FOUND: 'NotFound'
    NOT_IMPLEMENTED: 'NotImplemented'
    ILLEGAL_ARGUMENT: 'IllegalArgument'
    UNSUPPORTED_OPERATION: 'UnsupportedOperation'
    WRONG_TYPE: 'WrongType'

  error: (type, message) ->
    type: type
    message: "#{type} - #{message}"
    isCustom: true

  badRequest: (attributeName, expected, actualValue) ->
    error(Type.BAD_REQUEST, "#{attributeName} was expected to be of type #{expected}, but received #{actualValue}")

  unauthorized: (methodName, details) ->
    error(Type.UNAUTHORIZED, "#{methodName} is not allowed, you should be logged in : #{details}")

  forbidden: (methodName, details) ->
    error(Type.FORBIDDEN, "#{methodName} is forbidden (requires higher authorization level) : #{details}")

  notFound: (nodeType, key, value) ->
    error(Type.NOT_FOUND, "No #{nodeType} found for #{key} : #{value}")

  notImplemented: (methodName) ->
    error(Type.NOT_IMPLEMENTED, "You should implement method #{methodName}")

  entityNotFound: (nodeType, id) ->
    error(Type.NOT_FOUND, "No #{nodeType} found for id : #{id}")

  illegalArgument: (argumentValue, methodName) ->
    error(Type.ILLEGAL_ARGUMENT, "#{argumentValue} is not a valid value for method #{methodName}")

  unsupportedOperation: (methodName) ->
    error(Type.UNSUPPORTED_OPERATION, methodName)

  unsupportedOperation: (methodName, reason) ->
    error(Type.UNSUPPORTED_OPERATION, "#{methodName} is not supported : #{reason}")

  wrongType: (expected, actual) ->
    error(Type.WRONG_TYPE, "Expected type #{expected}, got #{actual}")