Controller = require '../Controller'
Resource = require '../../model/Resource'
Connection = require '../../model/Connection'
User = require '../../model/User'

module.exports = class AdminController extends Controller

  indexAllResources: (_) ->
    resources = Resource.listAll(_)
    for resource in resources
      resource.index _

  indexAllConnections: (_) ->
    connections = Connection.listAll(_)
    for connection in connections
      connection.index _

  ##indexAllUsers