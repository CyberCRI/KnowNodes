OwnedEntityController = require '../OwnedEntityController'
Resources = require '../../data/Resources'
Triplets = require '../../data/Triplets'

module.exports = class ResourceController extends OwnedEntityController

  constructor: (@request) ->
    super(@request, Resources)

  getId: ->
    @request.params.resource

  searchByKeyword: (_) ->
    @dataService.searchByKeyword(@getId(), _)

  findByUrl: (_) ->
    url = @request.body.url
    @dataService.findByUrl(url, _)

  findTripletsByResourceId: (_) ->
    Triplets.findByResourceId(@getId(), @getLoggedUserIfExists(_), _)
