OwnedNodeConverter = require './OwnedNodeConverter'
UserConverter = require './UserConverter'

module.exports = class ConnectionConverter extends OwnedNodeConverter

  @toJSON: (connection, _) ->
    json = super(connection, _)
    if connection.status is "deleted"
      json.creator = UserConverter.getJsonForDeletedUser()
    json