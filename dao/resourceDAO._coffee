resourceNode = require('../graph/resourceNode')

module.exports = class ResourceDAO

  constructor: (user) ->
    @node = new resourceNode user

  read: (id, _) ->
    return @node.read(id, _)

  create: (toCreate, _) ->
    created = @node.create toCreate, _
    #   TODO Log
    #   TODO Add Connection when Connection module is developed
    #    @relation.createOwnerRelationship created
    return created
