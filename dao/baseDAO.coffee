Edge = require '../graph/edge'
Logger = require '../log/logger'

###
Base class for all DAOs
###
module.exports = class BaseDAO

  constructor: (name, user) ->
    @edge = new Edge(user)
    @logger = new Logger(name, user)