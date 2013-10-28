CommentController = require('./CommentController')
Callback = require('../Callback')

module.exports =

  create: (request, response) ->
    new CommentController(request).create(Callback.bind(response))

  show: (request, response) ->
    new CommentController(request).show(Callback.bind(response))

  destroy: (request, response) ->
    new CommentController(request).destroy(Callback.bind(response))