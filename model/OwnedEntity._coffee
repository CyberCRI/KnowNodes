NodeWrapper = require './NodeWrapper'

module.exports = class OwnedEntity extends NodeWrapper

  ###
        CLASS METHODS
  ###

  # Overrides parent method to make sure the resource has a CREATED_BY relationship
  @create: (data, creator, _) ->
    data.active = true
    created = super(data, _)
    creator.setAsCreator(created, _)
    return created