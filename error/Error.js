(function() {
  var Exception;

  module.exports = Exception = (function() {
    function Exception() {}

    Exception.Type = {
      NOT_IMPLEMENTED: 'NotImplemented',
      ENTITY_NOT_FOUND: 'EntityNotFound',
      ILLEGAL_ARGUMENT: 'IllegalArgument',
      UNSUPPORTED_OPERATION: 'UnsupportedOperation',
      UNAUTHORIZED_OPERATION: 'UnauthorizedOperation'
    };

    Exception.exception = function(type, message) {
      return {
        type: type,
        message: "" + type + " - " + message,
        isCustom: true
      };
    };

    Exception.notImplemented = function(methodName) {
      return this.exception(this.Type.NOT_IMPLEMENTED, "You should implement method " + methodName);
    };

    Exception.entityNotFound = function(nodeType, id) {
      return this.exception(this.Type.ENTITY_NOT_FOUND, "No " + nodeType + " found for id : " + id);
    };

    Exception.entityNotFound = function(nodeType, key, value) {
      return this.exception(this.Type.ENTITY_NOT_FOUND, "No " + nodeType + " found for " + key + " : " + value);
    };

    Exception.illegalArgument = function(argumentValue, methodName) {
      return this.exception(this.Type.ILLEGAL_ARGUMENT, "" + argumentValue + " is not a valid value for method " + methodName);
    };

    Exception.unsupportedOperation = function(methodName) {
      return this.exception(this.Type.UNSUPPORTED_OPERATION, methodName);
    };

    Exception.unsupportedOperation = function(methodName, reason) {
      return this.exception(this.Type.UNSUPPORTED_OPERATION, "" + methodName + " is not supported : " + reason);
    };

    Exception.unauthorizedOperation = function(methodName, details) {
      return this.exception(this.Type.UNAUTHORIZED_OPERATION, "" + methodName + " is not allowed : " + details);
    };

    return Exception;

  })();

}).call(this);
