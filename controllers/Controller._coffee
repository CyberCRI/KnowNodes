Error = require '../error/Error'

module.exports = class Controller

  constructor: (@request, @dao) ->

  getId: ->
    throw Error.notImplemented('NodeWrapper.wrap()')

  create: (_) ->
    @checkUserLoggedIn('Controller.create()')
    @dao.create(@request.body, @request.user.KN_ID, _)

  show: (_) ->
    @dao.read(@getId(), _)

  update: (_) ->
    # Make sure the KN_ID in request body is the same as the ID in URL parameter
    data = @request.body
    data.KN_ID = @getId()
    @dao.update(@getId(), data, _)

  destroy: (_) ->
    @dao.delete(@getId(), _)

  checkUserLoggedIn: (methodName) ->
    if not @request.user?
      throw Error.unauthorizedOperation(methodName, 'User should be logged in')

  getLoggedUserId: ->
    @checkUserLoggedIn("getLoggedUserId")
    @request.user.KN_ID