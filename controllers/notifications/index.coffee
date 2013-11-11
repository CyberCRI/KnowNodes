Callback = require('../Callback')
NotificationController = require('./NotificationController')

module.exports =

  index: (request, response) ->
    new NotificationController(request).getNotificationsForLoggedInUser(Callback.bind(response))

  markAllAsRead: (request, response) ->
    new NotificationController(request).markAllAsRead(Callback.bind(response))
