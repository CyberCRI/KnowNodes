User = require '../model/User'
Logger = require '../log/logger'

module.exports = class UserDAO

  constructor: ->
    @logger = new Logger('UserDAO')

  read: (id, _) ->
    User.find(id, _)
