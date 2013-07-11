GraphElement = require './graphElement'
Edge = require './edge'

module.exports = class Node extends GraphElement

  constructor: (name, user) ->
    super(name, user)
    @edge = new Edge(user)