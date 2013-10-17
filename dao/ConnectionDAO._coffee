ResourceService = require '../model/ResourceService'
ConnectionService = require '../model/ConnectionService'
UserService = require '../model/UserService'
Logger = require '../log/logger'

module.exports = class ConnectionDAO

  constructor: ->
    @logger = new Logger('ConnectionDAO')

  create: (data, userId, _) ->
    startResource = ResourceService.find(data.fromNodeId, _)
    endResource = ResourceService.find(data.toNodeId, _)
    creator = UserService.find(userId, _)
    startResource.connectTo(endResource, creator, data, _)

  read: (id, _) ->
    return ConnectionService.find(id, _)

  update: (id, newData, _) ->
    connection = ConnectionService.find(id, _)
    connection.update(newData, _)
    return connection

  getTripletByConnectionId: (id, userId, _) ->
    if userId == "no user"
      user = userId
    else
      user = UserService.find(userId, _)
    ConnectionService.getTripletByConnectionId(id, user, _)

  latestTriplets: (userId, _) ->
    user = UserService.find(userId, _)
    ConnectionService.latestTriplets(user, _)

  hottestTriplets: (userId, _) ->
    if userId == "no user"
      user = userId
    else
      user = UserService.find(userId, _)
    ConnectionService.hottestTriplets(user, _)

  getTripletsByUserId: (profileUserId, currentUserId, _) ->
    if currentUserId == "no user"
      currentUser = currentUserId
    else
      currentUser = UserService.find(currentUserId, _)
    profileUser = UserService.find(profileUserId, _)
    ConnectionService.getTripletsByUserId(profileUser, currentUser, _)