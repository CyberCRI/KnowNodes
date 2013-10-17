Controller = require '../Controller'
Resource = require '../../model/Resource'
Connection = require '../../model/Connection'
User = require '../../model/User'

module.exports = class NotificationController extends Controller

  constructor: (@request) ->

  index: (_) ->
    mongoose = require 'mongoose'
    mongoose.connect 'mongodb://knownode_mongo:cri_1s_great@ds049347.mongolab.com:49347/heroku_app10244231'

    mongoose.connection.once('open', _)
    Notification = mongoose.model('Notification')
      #      Notification.findOne( {name: 'test'}, (err, result) ->
      #        if (err)
      #          console.log err
      #        response.json(result)
      #      )
    notification = new Notification({
      userId: 'test'
      object: {id: 'test', name: 'test'}
      action: 'test'
      count : 3
      date: new Date()
    })
    notification.save(_)
    notification