Resource = require '../model/Resource'
Connection = require '../model/Connection'
User = require '../model/User'
Logger = require '../log/logger'

module.exports = class VoteDAO

  constructor: ->
    @logger = new Logger('VoteDAO')

  create: (data, userId, _) ->
    creator = User.find(userId, _)
    votedConnection = Connection.find(data.fromNodeId, _)
    creator.connectTo(votedConnection, creator, data, _)

  read: (id, _) ->
    Connection.find(id, _)

  update: (id, newData, _) ->
    connection = Connection.find(id, _)
    connection.update(newData, _)
    return connection

  delete: (id, _) ->
    connection = Connection.find(id, _)
    connection.delete _