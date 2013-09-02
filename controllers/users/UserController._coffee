Controller = require '../Controller'
UserDAO = require '../../dao/UserDAO'
User = require '../../model/User'

module.exports = class UserController extends Controller

  constructor: (@request) ->
    super(@request, new UserDAO())

  getId: ->
    @request.params.user

  create: (_) ->
    User.create(@request.body, _)

  findByEmail: (_) ->
    email = @request.body.email
    User.findByEmail(email, _)
