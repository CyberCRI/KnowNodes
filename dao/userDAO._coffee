DAO = require './DAO'
UserValidator = require '../validation/userValidator'

module.exports = class UserDAO extends DAO

  constructor: (user) ->
    super('kn_User', new UserValidator, user)
