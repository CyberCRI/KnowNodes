Controller = require '../Controller'
Resources = require '../../data/Resources'
Connections = require '../../data/Connections'

module.exports = class AdminController extends Controller

  indexAllResources: (_) ->
    resources = Resources.listAll(_)
    for resource in resources
      resource.index _

  indexAllConnections: (_) ->
    connections = Connections.listAll(_)
    for connection in connections
      connection.index _

  indexAllUsers: (_) ->
    users = Users.listAll(_)
    for user in users
      user.index _
