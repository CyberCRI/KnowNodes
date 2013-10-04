Connection = require '../model/Connection'
User = require '../model/User'
Logger = require '../log/logger'

module.exports = class VoteDAO

  constructor: ->
    @logger = new Logger('VoteDAO')

  voteUp: (userId, targetId, _) ->
    user = User.find(userId, _)
    console.log("voteUp:user:" ,user)
    target = Connection.find(targetId, _)
    user.voteUp(target, _)

  voteDown: (userId, targetId, _) ->
    user = User.find(userId, _)
    target = Connection.find(targetId, _)
    console.log("voteDown:user:" ,user)
    user.voteDown(target, _)

  cancelVote: (userId, targetId, _) ->
    user = User.find(userId, _)
    target = Connection.find(targetId, _)
    console.log("cancelVote:user:" ,user)
    user.cancelVote(target, _)
