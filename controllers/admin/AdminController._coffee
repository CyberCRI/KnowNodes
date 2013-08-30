Controller = require '../Controller'
Resource = require '../../model/Resource'
Connection = require '../../model/Connection'
User = require '../../model/User'
bcrypt = require 'bcrypt'

module.exports = class AdminController extends Controller

  constructor: (@request) ->

  indexAllResources: (_) ->
    resources = Resource.listAll(_)
    for resource in resources
      resource.index _

  indexAllConnections: (_) ->
    connections = Connection.listAll(_)
    for connection in connections
      connection.index _

  hashAllPasswords: (_) ->
    users = User.listAll(_)
    for user in users
      password = user.getProperty('password', _)
      if (password? and not (password.indexOf('$2a$04$') is 0)) # Make sure password is not already hashed
        hash = bcrypt.hashSync(password, 4)
        console.log hash