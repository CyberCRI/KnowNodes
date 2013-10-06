Callback = require('../Callback')
VoteController = require('./VoteController')

module.exports =

  voteUp: (request, response) ->
    new VoteController(request).voteUp(Callback.bind(response))

  voteDown: (request, response) ->
    new VoteController(request).voteDown(Callback.bind(response))

  cancelVote: (request, response) ->
    new VoteController(request).cancelVote(Callback.bind(response))