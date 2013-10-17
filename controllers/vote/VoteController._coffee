Controller = require '../Controller'
Connections = require '../../data/Connections'

module.exports = class VoteController extends Controller

  constructor: (@request) ->
    super(@request, null)

  findTarget: (_) ->
    Connections.find(@request.body.connectionId, _)

  voteUp: (_) ->
    user = @getLoggedUser _
    target = @findTarget _
    user.voteUp(target, _)

  voteDown: (_) ->
    user = @getLoggedUser _
    target = @findTarget _
    user.voteDown(target, _)

  cancelVote: (_) ->
    user = @getLoggedUser _
    target = @findTarget _
    user.cancelVote(target, _)

