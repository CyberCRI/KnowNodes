Resource = require '../model/Resource'
User = require '../model/User'
Logger = require '../log/logger'
Error = require '../error/Error'

module.exports = class WikiDAO

  makeWikipediaUrl: (title) ->
    'http://en.wikipedia.org/wiki/' + title.replace(/\ /g, "_")

  constructor: ->
    @logger = new Logger('WikiDAO')

  findOrCreate: (title, userId, _) ->
    url = @makeWikipediaUrl(title)
    # Check resource doesn't already exist
    try
      Resource.findByUrl(url, _) # Return resource if exists
    catch error
      if error.isCustom and error.type is Error.Type.ENTITY_NOT_FOUND
        # Resource does not exist, proceed to create it
        data =
          title: title
          url: url
          resourceType: Resource.Type.WIKIPEDIA_ARTICLE
        creator = User.find(userId, _)
        Resource.create(data, creator, _)
      else # Unexpected error
        throw error

  findByTitle: (title, _) ->
    @logger.debug("findByTitle (title: #{title})")
    url = @makeWikipediaUrl(title)
    Resource.findByUrl(url, _)