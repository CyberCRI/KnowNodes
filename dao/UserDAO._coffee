UserService = require '../model/UserService'
Logger = require '../log/logger'

module.exports = class UserDAO

  constructor: ->
    @logger = new Logger('UserDAO')

  read: (id, _) ->
    user = UserService.find(id, _)
    delete user.node._data.data.password
    karma = UserService.karma(id, _)
    user.setProperty('karma', karma)
    user
