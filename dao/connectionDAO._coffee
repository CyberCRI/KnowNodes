DAO = require './DAO'
ConnectionValidator = require '../validation/connectionValidator'
UserDAO = require './userDAO'
ResourceDAO = require './resourceDAO'

module.exports = class ConnectionDAO extends DAO

  constructor: (@user) ->
    super('kn_Edge', new ConnectionValidator, user)
    @userDAO = new UserDAO(@user)
    @resourceDAO = new ResourceDAO(@user)

  create: (toCreate, _) ->
    toCreate.active = true
    created = super(toCreate, _)
    userNode = @userDAO.read(@user.KN_ID, _)
    @edge.addCreatedByRelationship(created, userNode, _)
    startResource = @resourceDAO.read(toCreate.fromNodeId, _)
    @edge.addResourceToConnectionRelationship(startResource, created, _)
    endResource = @resourceDAO.read(toCreate.toNodeId, _)
    @edge.addConnectionToResourceRelationship(created, endResource, _)
    return created