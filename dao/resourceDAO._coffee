DAO = require './DAO'
ResourceValidator = require '../validation/resourceValidator'
UserDAO = require './userDAO'

module.exports = class ResourceDAO extends DAO

  constructor: (@user) ->
    super('kn_Post', new ResourceValidator, @user)
    @userDAO = new UserDAO(@user)

  create: (toCreate, _) ->
    toCreate.active = true
    created = super(toCreate, _)
    userNode = @userDAO.read(@user.KN_ID, _)
    @edge.addCreatedByRelationship(created, userNode, _)
    return created