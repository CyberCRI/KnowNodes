NodeWrappers = require './NodeWrappers'
User = require './../model/User'
Type = require './../model/Type'
UserValidator = require './../model/validation/UserValidator'
cache = require 'memory-cache'
bcrypt = require 'bcrypt-nodejs'

module.exports = class Users extends NodeWrappers

  @VALIDATOR = new UserValidator

  @getNodeType: -> Type.USER

  @wrap: (node) -> new User(node)

  @create: (data, _) ->
    hashedPassword = bcrypt.hashSync(data.password)
    data.password = hashedPassword
    super(data, _)

  @findById: (id, _) ->
    user = cache.get 'USER_' + id
    if not user?
      userNode = @DB.getIndexedNode('kn_User', 'KN_ID', id, _)
      # TODO Check user exists
      user = new User(userNode)
      cache.put('USER_' + user.getId(), user, 1000)
      user

  @findByEmail: (email, _) ->
    @findByTextProperty('email', email, _)

  @karma: (id, _) ->
    user = @findById(id, _)
    query = """
            START user=node(#{user.node.id})
            MATCH (connection) -[:CREATED_BY]- (user),
            (connection) -[?:VOTED_UP]- (upvotes),
            (connection) -[?:VOTED_DOWN]- (downvotes)
            WHERE connection.nodeType = 'kn_Edge'
            RETURN count(upvotes) - count(downvotes) AS karma
            """
    @DB.query(query, null, _)[0].karma
