OwnedEntityController = require '../OwnedEntityController'
Comments = require '../../data/Comments'
Connections = require '../../data/Connections'

module.exports = class CommentController extends OwnedEntityController

  constructor: (@request) ->
    super(@request, Comments)

  getId: ->
    @request.params.comment

  create: (_) ->
    data = @request.body
    if not data.connectionId?
      throw Error.badRequest('connectionId', 'String', data.connectionId)
    connection = Connections.find(data.connectionId, _)
    user = @getLoggedUser(_)
    @dataService.create(data, connection, user, _)

  destroy: (_) ->
    super(_, true) # Force deletion