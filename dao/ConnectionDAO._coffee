Resource = require '../model/Resource'
Connection = require '../model/Connection'
User = require '../model/User'
Logger = require '../log/logger'

module.exports = class ConnectionDAO

  constructor: ->
    @logger = new Logger('ConnectionDAO')

  create: (data, userId, _) ->
    startResource = Resource.find(data.fromNodeId, _)
    endResource = Resource.find(data.toNodeId, _)
    creator = User.find(userId, _)
    startResource.connectTo(endResource, creator, data, _)

  read: (id, _) ->
    Connection.find(id, _)

  update: (id, newData, _) ->
    connection = Connection.find(id, _)
    connection.update(newData, _)
    return connection

  delete: (id, _) ->
    connection = Connection.find(id, _)
    connection.delete _

  latestTriplets: (userId, _) ->
    user = User.find(userId, _)
    Connection.latestTriplets(user, _)