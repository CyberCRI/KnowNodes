Controller = require '../Controller'
Resource = require '../../model/Resource'

module.exports = class AdminController extends Controller

  constructor: (@request) ->

  reindexAllResources: (_) ->
    resources = Resource.listAll(_)
    for resource in resources
      resource.index()