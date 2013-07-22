Controller = require '../Controller'
VoteDAO = require '../../dao/VoteDAO'
User = require '../../model/User'

module.exports = class VoteController extends Controller

  constructor: (@request) ->
    super(@request, new VoteDAO)

  voteUp: (_) ->
    @dao.voteUp(@getLoggedUserId(), @request.body.connectionId, _)

  voteDown: (_) ->
    @dao.voteDown(@getLoggedUserId(), @request.body.connectionId, _)

