Controller = require '../Controller'
Resource = require '../../model/Resource'
Connection = require '../../model/Connection'
User = require '../../model/User'
mongoose = require 'mongoose'
Notifications = require '../../data/Notifications'
Error = require '../../error/Error'

module.exports = class NotificationController extends Controller

  getNotificationsForLoggedInUser: (_) ->
    Notifications.findByNotifiedUserId(@getLoggedUserId(), _)

  markAllAsRead : (_) ->
    Notifications.markAllAsRead(@getLoggedUserId(), _)