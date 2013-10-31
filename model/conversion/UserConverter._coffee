NodeConverter = require './NodeConverter'

module.exports = class UserConverter extends NodeConverter

  @toJSON: (user, _) ->
    json = super(user, _)
    delete json.dateOfBirth
    delete json.email
    delete json.__CreatedOn__
    delete json.password
    json.fullName = user.fullName
    json

  @getJsonForDeletedUser: ->
    json =
      firstName: "deleted"
      lastName: " "
      fullName: "deleted"
      KN_ID: "deleted"
      id: "deleted"