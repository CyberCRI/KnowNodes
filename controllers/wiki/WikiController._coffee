Controller = require '../Controller'
WikiDAO = require '../../dao/WikiDAO'

module.exports = class WikiController extends Controller

  constructor: (@request) ->
    super(@request, new WikiDAO())

  findOrCreate: (_) ->
    @checkUserLoggedIn('WikiController.findOrCreate()')
    @dao.findOrCreate(@request.body.title, @request.user.KN_ID, _)

  findByTitle: (_) ->
    title = @request.params.wiki
    @dao.findByTitle(title, _)