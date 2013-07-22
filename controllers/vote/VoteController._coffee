Controller = require '../Controller'
VoteDAO = require '../../dao/VoteDAO'

module.exports = class VoteController extends Controller

  constructor: (@request) ->
    super(@request, new VoteDAO())