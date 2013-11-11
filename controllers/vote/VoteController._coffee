Controller = require '../Controller'
Connections = require '../../data/Connections'
Votes = require '../../data/Votes'

module.exports = class VoteController extends Controller

  constructor: (@request) ->
    super(@request, null)

  findTarget: (_) ->
    Connections.find(@request.body.connectionId, _)

  voteUp: (_) ->
    user = @getLoggedUser _
    target = @findTarget _
    Votes.voteUp(target, user, _)

  voteDown: (_) ->
    user = @getLoggedUser _
    target = @findTarget _
    Votes.voteDown(target, user, _)

  cancelVote: (_) ->
    user = @getLoggedUser _
    target = @findTarget _
    Votes.cancelVote(target, user, _)

