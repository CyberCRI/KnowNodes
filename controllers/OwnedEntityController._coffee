Controller = require './Controller'
Users = require '../data/Users'

module.exports = class OwnedEntityController extends Controller

  create: (_) ->
    data = @request.body
    user = @getLoggedUser(_)
    @dataService.create(data, user, _)