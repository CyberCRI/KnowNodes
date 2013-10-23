Notifications = require './Notifications'

module.exports =

  voteUp: (target, user, _) ->
    Notifications.notifyConnectionUpvoted(target, user, _)
    user.voteUp(target, _)

  voteDown: (target, user, _) ->
    user.voteDown(target, _)

  cancelVote: (target, user, _) ->
    user.cancelVote(target, _)