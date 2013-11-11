NodeConverter = require './NodeConverter'

module.exports = class OwnedNodeConverter extends NodeConverter

  @toJSON: (entity, _) ->
    json = super(entity, _)
    creator = entity.getCreator _
    creatorJSON = creator.toJSON _
    json.creator = creatorJSON
    json