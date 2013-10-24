mongoose = require 'mongoose'
Type = require './Type'

notificationSchema = mongoose.Schema({
  notifiedUserId: String
  actor:
    id: String
    fullName: String
  action: String
  target:
    id: String
    title: String
    type: { type: String, enum: [Type.RESOURCE, Type.CONNECTION] }
  creationDate: { type: Date, default: Date.now }
  alreadyRead: { type: Boolean, default: false }
  triplet: mongoose.Schema.Types.Mixed
})

model = mongoose.model('Notification', notificationSchema)

model.Action =
  COMMENTED: 'comment'
  UPVOTED: 'vote'
  CONNECTED: 'create'

module.exports = model