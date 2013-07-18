Resource = require '../model/Resource'
User = require '../model/User'
Logger = require '../log/logger'
Error = require '../error/Error'

module.exports = class WikiDAO

  makeWikipediaUrl: (title) ->
    'http://en.wikipedia.org/wiki/' + title.replace(/\ /g, "_")

  constructor: ->
    @logger = new Logger('WikiDAO')

  create: (data, userId, _) ->
    url = @makeWikipediaUrl(data.title)
    # Check resource doesn't already exist
    try
      Resource.findByUrl(url, _) # Return resource if exists
    catch error
      if error.isCustom and error.type is Error.Type.ENTITY_NOT_FOUND
        # Resource does not exist, proceed to create it
        data.url = url
        data.resourceType = Resource.Type.WIKIPEDIA_ARTICLE
        creator = User.find(userId, _)
        created = Resource.create(data, creator, _)
      else # Unexpected error
        throw error

  findByTitle: (title, _) ->
    @logger.debug("findByTitle (title: #{title})")
    url = @makeWikipediaUrl(title)
    Resource.findByUrl(url, _)