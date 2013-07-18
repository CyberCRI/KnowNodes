Controller = require '../Controller'
ConnectionDAO = require '../../dao/ConnectionDAO'

module.exports = class ConnectionController extends Controller

  constructor: (@request) ->
    super(@request, new ConnectionDAO())

  getId: ->
    @request.params.connection