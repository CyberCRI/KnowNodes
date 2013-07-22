Callback = require('../Callback')
VoteController = require('./VoteController')

module.exports =

  create: (request, response) ->
    new VoteController(request).vote(Callback.bind(response))