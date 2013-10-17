Connections = require '../data/Connections'
Users = require '../data/Users'
Logger = require '../log/logger'

module.exports = class VoteDAO

  constructor: ->
    @logger = new Logger('VoteDAO')

  voteUp: (userId, targetId, _) ->
    user = UserService.find(userId, _)
    target = ConnectionService.find(targetId, _)
    user.voteUp(target, _)

  voteDown: (userId, targetId, _) ->
    user = UserService.find(userId, _)
    target = ConnectionService.find(targetId, _)
    user.voteDown(target, _)

  cancelVote: (userId, targetId, _) ->
    user = UserService.find(userId, _)
    target = ConnectionService.find(targetId, _)
    user.cancelVote(target, _)
