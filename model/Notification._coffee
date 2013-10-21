mongoose = require 'mongoose'
notificationSchema = mongoose.Schema({
  userId: String
  object: {
    id: String
    title: String
  }
  action: String
  count: Number
  date: Date
})

mongoose.model('Notification', notificationSchema)