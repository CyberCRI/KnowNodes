Callback = require('../Callback')
NotificationController = require('./NotificationController')

module.exports =

  index: (request, response) ->
    new NotificationController(request).index(Callback.bind(response))