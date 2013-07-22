NodeWrapper = require './NodeWrapper'
Type = require './Type'
UserValidator = require './validation/userValidator'
cache = require 'memory-cache'

module.exports = class User extends NodeWrapper

  @VALIDATOR = new UserValidator

  ###
        CLASS METHODS
  ###

  @getNodeType: -> Type.USER

  @wrap: (node) -> new User(node)

  @findById: (id, _) ->
    user = cache.get 'USER_' + id
    if not user?
      db = @getDB()
      userNode = db.getIndexedNode('kn_User', 'KN_ID', id, _)
      # TODO Check user exists
      user = new User(userNode)
      cache.put('USER_' + user.getId(), user, 1000)
    return user

  ###
        INSTANCE METHODS
  ###

  constructor: (node) ->
    super node

  isLoggedIn: ->
    @node?

  setAsCreator: (created, _) ->
    properties = {creationDate: new Date()}
    @node.createRelationshipTo(created.node, 'CREATED_BY', properties, _)

  validate: ->
    new UserValidator().validate(@node.data)

  save: (_) ->
    super _
    cache.put('USER_' + @getId(), @, 1000)

  hasVotedUp: (target, _) ->
    @hasRelationship(target, 'VOTED_UP', _)

  hasVotedDown: (target, _) ->
    @hasRelationship(target, 'VOTED_DOWN', _)

  voteUp: (target, _) ->
    if @hasVotedUp(target, _)
      return "already voted up"
    if @hasVotedDown(target, _)
      @getRelationship(target, 'VOTED_DOWN', _).delete _
    @node.createRelationshipTo(target.node, 'VOTED_UP', null, _)
    return "upvote created"

  voteDown: (target, _) ->
    console.log 'voteDown'
    if @hasVotedDown(target, _)
      return "already voted down"
    if @hasVotedUp(target, _)
      @getRelationship(target, 'VOTED_UP', _).delete _
    @node.createRelationshipTo(target.node, 'VOTED_DOWN', null, _)
    return "downvote created"