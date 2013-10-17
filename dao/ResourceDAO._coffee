ResourceService = require '../model/ResourceService'
UserService = require '../model/UserService'
Logger = require '../log/logger'

module.exports = class ResourceDAO

  constructor: ->
    @logger = new Logger('ResourceDAO')

  create: (data, userId, _) ->
    creator = UserService.find(userId, _)
    created = ResourceService.create(data, creator, _)

  read: (id, _) ->
    return ResourceService.find(id, _)

  update: (id, newData, _) ->
    resource = ResourceService.find(id, _)
    resource.update(newData, _)
    return resource

  delete: (id, _) ->
    resource = ResourceService.find(id, _)
    resource.delete _

  searchByKeyword: (query, _) ->
    @logger.debug("searchByKeyword (query: #{query})")
    ResourceService.searchByKeyword(query, _)

  findByUrl: (url, _) ->
    @logger.debug("searchByUrl (url: #{url})")
    ResourceService.findByUrl(url, _)

  findTripletsByResourceId: (id, userId, _) ->
    if userId == "no user"
      user = userId
    else
      user = UserService.find(userId, _)
    ResourceService.findTripletsByResourceId(id, user, _)