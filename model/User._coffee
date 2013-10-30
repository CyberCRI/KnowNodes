NodeWrapper = require './NodeWrapper'
Type = require './Type'
UserValidator = require './validation/UserValidator'
UserConverter = require './conversion/UserConverter'
cache = require 'memory-cache'
bcrypt = require 'bcrypt'
Error = require '../error/Error'

module.exports = class User extends NodeWrapper

  @getter fullName: ->
    "#{@getProperty('firstName')} #{@getProperty('lastName')}"

  isLoggedIn: ->
    @node?

  setAsCreator: (created, _) ->
    properties = {creationDate: new Date()}
    created.node.createRelationshipTo(@node, 'CREATED_BY', properties, _)

  isCreatorOf: (content, _) ->
    @hasRelationshipWith(content, 'CREATED_BY', _)

  validate: ->
    new UserValidator().validate(@node.data)

  getConverter: ->
    UserConverter

  # TODO Instead of having to override the index() method,
  #      specifying the indexed fields of an entity should be declarative
  index: (_) ->
    super _
    @indexTextProperty('email', _)

  save: (_) ->
    super _
    cache.put('USER_' + @getId(), @, 1000)

  voteUp: (target, _) ->
    if not target?
      throw Error.illegalArgument(target, 'User.voteUp()')
    @deleteRelationshipIfExists(target, 'VOTED_DOWN', _)
    if @hasVotedUp(target, _)
      return "already voted up"
    @node.createRelationshipTo(target.node, 'VOTED_UP', null, _)
    return "upvote created"

  hasVotedUp: (target, _) ->
    @hasRelationshipWith(target, 'VOTED_UP', _)

  voteDown: (target, _) ->
    if not target?
      throw Error.illegalArgument(target, 'User.voteDown()')
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