Connection = require '../model/Connection'
User = require '../model/User'
Logger = require '../log/logger'

module.exports = class VoteDAO

  constructor: ->
    @logger = new Logger('VoteDAO')

  voteUp: (userId, targetId, _) ->
    console.log("voteUpDAO")
    user = User.find(userId, _)
    target = Connection.find(targetId, _)
    user.voteUp(target, _)
