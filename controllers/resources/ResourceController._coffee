Controller = require '../Controller'
ResourceDAO = require '../../dao/ResourceDAO'

module.exports = class ResourceController extends Controller

  constructor: (@request) ->
    super(@request, new ResourceDAO())

  getId: ->
    @request.params.resource

  searchByKeyword: (_) ->
    # TODO Remove the useless string sanitization
    query = @request.params.resource.replace /:/g, ''
    @dao.searchByKeyword(query, _)

  findByUrl: (_) ->
    url = @request.body.url
    @dao.findByUrl(url, _)

  findTripletsByResourceId: (_) ->
    @dao.findTripletsByResourceId(@getId(), _)