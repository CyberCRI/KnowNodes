Controller = require './Controller'
Users = require '../data/Users'

module.exports = class OwnedEntityController extends Controller

  create: (_) ->
    data = @request.body
    user = @getLoggedUser(_)
    @dataService.create(data, user, _)

  destroy: (_, force=false) ->
    # Make sure creator made the request
    entity = @dataService.find(@getId(), _)
    user = @getLoggedUser(_)
    if user.isCreatorOf(entity, _)
      entity.delete(_, force)
    else
      Error.forbidden('Entity Deletion', 'You should be the creator of the entity you wish to delete')