Callback = require('../Callback')
NotificationController = require('./NotificationController')

module.exports =

  create: (request, response) ->
    new NotificationController(request).markNotificationsAsRead(Callback.bind(response))

  index: (request, response) ->
    new NotificationController(request).getNotificationsForLoggedInUser(Callback.bind(response))