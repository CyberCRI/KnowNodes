Resources = require './Resources'
Users = require './Users'

module.exports =

  makeWikipediaUrl: (title) ->
    'http://en.wikipedia.org/wiki/' + title.replace(/\ /g, "_")

  findOrCreate: (title, userId, _) ->
    url = @makeWikipediaUrl(title)
    # Check resource doesn't already exist
    try
      Resources.findByUrl(url, _) # Return resource if exists
    catch error
      if error.isCustom and error.type is Error.Type.NOT_FOUND
        # Resource does not exist, proceed to create it
        data =
          title: title
          url: url
          resourceType: Type.WIKIPEDIA_ARTICLE
        creator = Users.find(userId, _)
        Resources.create(data, creator, _)
      else # Unexpected error
        throw error

  findByTitle: (title, _) ->
    url = @makeWikipediaUrl(title)
    Resources.findByUrl(url, _)