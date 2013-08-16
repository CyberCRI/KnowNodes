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
    return Connection.find(id, _)

  update: (id, newData, _) ->
    connection = Connection.find(id, _)
    connection.update(newData, _)
    return connection

  delete: (id, _) ->
    connection = Connection.find(id, _)
    connection.delete _

  getTripletByConnectionId: (id, userId, _) ->
    console.log("we are at the dao")
    if userId == "no user"
      user = userId
    else
      user = User.find(userId, _)
    Connection.getTripletByConnectionId(id, user, _)

  latestTriplets: (userId, _) ->
    user = User.find(userId, _)
    Connection.latestTriplets(user, _)

  hottestTriplets: (userId, _) ->
    if userId == "no user"
      user = userId
    else
      user = User.find(userId, _)
    Connection.hottestTriplets(user, _)

  getTripletsByUserId: (profileUserId, currentUserId, _) ->
    if currentUserId == "no user"
      currentUser = currentUserId
    else
      currentUser = User.find(currentUserId, _)
    profileUser = User.find(profileUserId, _)
    Connection.getTripletsByUserId(profileUser, currentUser, _)