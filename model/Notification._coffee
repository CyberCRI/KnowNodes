mongoose = require 'mongoose'

notificationSchema = mongoose.Schema({
  notifiedUserId: String
  actor:
    id: String
    name: String
  action: String
  target: mongoose.Schema.Types.Mixed
  createdOn: { type: Date, default: Date.now }
  alreadyRead: { type: Boolean, default: false }
})

model = mongoose.model('Notification', notificationSchema)

model.Action =
  COMMENTED: 'commented'
  UPVOTED: 'upvoted'
  CONNECTED: 'connected'

module.exports = model