Resource = require '../model/Resource'
User = require '../model/User'
Logger = require '../log/logger'

module.exports = class ResourceDAO

  constructor: ->
    @logger = new Logger('ResourceDAO')

  create: (data, userId, _) ->
    creator = User.find(userId, _)
    created = Resource.create(data, creator, _)

  read: (id, _) ->
    return Resource.find(id, _)

  update: (id, newData, _) ->
    resource = Resource.find(id, _)
    resource.update(newData, _)
    return resource

  delete: (id, _) ->
    resource = Resource.find(id, _)
    resource.delete _

  searchByKeyword: (query, _) ->
    @logger.debug("searchByKeyword (query: #{query})")
    Resource.searchByKeyword(query, _)

  findByUrl: (url, _) ->
    @logger.debug("searchByUrl (url: #{url})")
    Resource.findByUrl(url, _)

  findTripletsByResourceId: (id, userId, _) ->
    if userId == "no user"
      user = userId
    else
      user = User.find(userId, _)
    Resource.findTripletsByResourceId(id, user, _)