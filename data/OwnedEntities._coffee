NodeWrappers = require './NodeWrappers'
Error = require '../error/Error'

module.exports = class OwnedEntities extends NodeWrappers

  # Overrides parent method to make sure the entity has a CREATED_BY relationship
  @create: (data, creator, _) ->
    if (not data? or not creator?)
      throw Error.illegalArgument('null', 'OwnedEntities.create()')
    created = super(data, _)
    creator.setAsCreator(created, _)
    created