Controller = require '../Controller'
WikiResources = require '../../data/WikiResources'

module.exports = class WikiController extends Controller

  constructor: (@request) ->
    super(@request, null)

  findOrCreate: (_) ->
    @checkUserLoggedIn('WikiController.findOrCreate()')
    WikiResources.findOrCreate(@request.body.title, @request.user.KN_ID, _)

  findByTitle: (_) ->
    title = @request.params.wiki
    WikiResources.findByTitle(title, _)