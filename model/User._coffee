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

  voteUp: (target, _) ->
    @deleteRelationshipIfExists(target, 'VOTED_DOWN', _)
    if @hasVotedUp(target, _)
      return "already voted up"
    @node.createRelationshipTo(target.node, 'VOTED_UP', null, _)
    return "upvote created"

  hasVotedUp: (target, _) ->
    @hasRelationshipWith(target, 'VOTED_UP', _)

  voteDown: (target, _) ->
    @deleteRelationshipIfExists(target, 'VOTED_UP', _)
    if @hasVotedDown(target, _)
      return "already voted down"
    @node.createRelationshipTo(target.node, 'VOTED_DOWN', null, _)
    return "downvote created"

  hasVotedDown: (target, _) ->
    @hasRelationshipWith(target, 'VOTED_DOWN', _)

  cancelVote: (target, _) ->
    @deleteRelationshipIfExists(target, 'VOTED_UP', _)
    @deleteRelationshipIfExists(target, 'VOTED_DOWN', _)

