Controller = require '../Controller'
ResourceDAO = require '../../dao/ResourceDAO'

module.exports = class ResourceController extends Controller

  constructor: (@request) ->
    super(@request, new ResourceDAO())

  getId: ->
    @request.params.resource

  searchByKeyword: (_) ->
    query = @request.params.resource.replace /:/g, ''
    @dao.searchByKeyword(query, _)