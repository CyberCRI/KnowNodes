Controller = require '../Controller'
WikiDAO = require '../../dao/WikiDAO'

module.exports = class WikiController extends Controller

  constructor: (@request) ->
    super(@request, new WikiDAO())

  findByTitle: (_) ->
    title = @request.params.wiki
    @dao.findByTitle(title, _)