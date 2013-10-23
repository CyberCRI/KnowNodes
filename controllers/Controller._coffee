Error = require '../error/Error'
Users = require '../data/Users'

module.exports = class Controller

  constructor: (@request, @dataService) ->

  getId: ->
    throw Error.notImplemented('Controller.getId()')

  getEntity: (_) ->
    @dataService.find(@getId(), _)

  create: (_) ->
    @checkUserLoggedIn('Controller.create()')
    @dataService.create(@request.body, _)

  show: (_) ->
    @getEntity(_)

  update: (_) ->
    newData = @request.body
    newData.KN_ID = @getId() # Match KN_ID in request body with ID in URL
    entity = @getEntity(_)
    entity.update(newData, _)

  destroy: (_) ->
    entity = @getEntity(_)
    entity.delete(_)

  checkUserLoggedIn: (methodName) ->
    if not @isUserLoggedIn()
      throw Error.unauthorizedOperation(methodName, 'User should be logged in')

  isUserLoggedIn: ->
    @request.user?

  getLoggedUserId: ->
    @checkUserLoggedIn("Controller.getLoggedUserId()")
    @request.user.KN_ID

  getLoggedUser: (_) ->
    Users.find(@getLoggedUserId(), _)

  getLoggedUserIdIfExists: ->
    if @request.user?
      @request.user.KN_ID
    else
      null

  getLoggedUserIfExists: (_) ->
    if @request.user?
      @getLoggedUser(_)
    else
      null
