DBModule = require '../modules/DBModule'

module.exports = class Resource extends DBModule

  constructor: (user) ->
    super user

  read: (id, _) ->
    params =
      where:
        KN_ID: id
    resource = @DB.Resource.findOne(params, _)
#    resource = @DB.ResourceDAO.find id, _
    resource.id = resource.KN_ID
    return resource

  create: (toCreate, _) ->
    created = @DB.ResourceDAO.create toCreate, _
#    created.index 'kn_Post', 'KN_ID', created.KN_ID, _
    #   TODO Log
    #   TODO Add Connection when Connection module is developed
#    @relation.createOwnerRelationship concept
    created.id = created.KN_ID
    return created

  update: (id, toUpdate, _) ->
#   TODO Log
    params =
      where:
        KN_ID: id

    console.log(id)
    resource = @DB.ResourceDAO.findOne(params, _)
    console.log resource
    resource.updateAttributes(toUpdate, _)

#  delete: (conceptId, _) =>
#    @logger.logDebug @currentModule, "deleteConcept #{conceptId}"
#    concept = @DB.Post.find nodeId, _
#    concept.destroy _
