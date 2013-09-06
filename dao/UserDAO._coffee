User = require '../model/User'
Logger = require '../log/logger'

module.exports = class UserDAO

  constructor: ->
    @logger = new Logger('UserDAO')

  read: (id, _) ->
    user = User.find(id, _)
    delete user.node._data.data.password
    karma = User.karma(id, _)
    user.setProperty('karma', karma)
    user
