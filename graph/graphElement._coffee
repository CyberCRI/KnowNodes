cache = require('memory-cache')
Logger = require '../log/logger'

###
Base class for all graph layer services
###
module.exports = class GraphElement

  constructor: (name, user) ->
    @DB = require('../DB/knownodeDB')
    @neo4jDB = @DB.getNeo4jDB()
    @logger = new Logger(name, user)
    if user and user.id
      @user = cache.get 'USER_' + user.id
      if not @user?
        @neo4jDB.getNodeById user.id, (err, usr) =>
          if not err?
            cache.put('USER_' + user.id, usr, 1000)
            @user = usr
    else
      @user = user or {}
