Notification = require '../model/Notification'
Triplets = require './Triplets'
Resources = require './Resources'
Type = require '../model/Type'
GraphDB = require '../DB/GraphDB'
User = require '../model/User'
Error = require '../error/Error'

module.exports =

  findByNotifiedUserId: (notifiedUserId, _) ->
    Notification.find( {notifiedUserId: notifiedUserId}, _)

  create: (data) ->
    notification = new Notification(data)
    notification.save((error) ->
      if error?
        console.log 'ERROR : Notifications.create() - ', error
    )
    notification

  notifyConnectionUpvoted: (connection, actor, _) ->
    notifiedUser = connection.getCreator _
    connection.checkNodeType(Type.CONNECTION)
    triplet = Triplets.findByConnectionId(connection.id, null, _)
    triplet.type = Type.TRIPLET
    triplet.startResource.id = triplet.startResource.KN_ID
    triplet.connection.id = triplet.connection.KN_ID
    triplet.endResource.id = triplet.endResource.KN_ID
    @create({
      notifiedUserId: notifiedUser.id
      actor:
        id: actor.id
        fullName: actor.fullName
      action: Notification.Action.UPVOTED
      target:
        id: connection.id
        title: connection.title
        type: Type.CONNECTION
      triplet: triplet
      })

  notifyConnectionCreated: (startResource, endResource, connection, actor, _) ->
    startResource.checkNodeType(Type.RESOURCE)
    endResource.checkNodeType(Type.RESOURCE)
    ids = []
    usersToNotify = []
    result1 = @getNotifiedUsersForConnectedResource(startResource, _)
    result2 = @getNotifiedUsersForConnectedResource(endResource, _)
    for element in result1
      user = new User(element.userToNotify)
      ids.push user.id
      user.notifiedFor = startResource
      usersToNotify.push user
    for element in result2
      user = new User(element.userToNotify)
      if user.id not in ids
        ids.push user.id
        user.notifiedFor = endResource
        usersToNotify.push user
    for user in usersToNotify
      resource = user.notifiedFor
      @create({
        notifiedUserId: user.id
        actor:
          id: actor.id
          fullName: actor.fullName
        action: Notification.Action.CONNECTED
        target:
          id: resource.id
          title: resource.title
          type: Type.RESOURCE
      })
    connection

  getNotifiedUsersForConnectedResource: (resource, _) ->
    query = """
      START resource=node(#{resource.node.id})
      MATCH resource-[?:CREATED_BY]-userToNotify,
      resource-[?:RELATED_TO]-connection-[?:CREATED_BY]-userToNotify
      RETURN distinct userToNotify
    """
    GraphDB.get().query(query, _)

  markAllAsRead: (userId, _) ->
    conditions = { notifiedUserId: userId, alreadyRead:false }
    update = { alreadyRead:true }
    options = { multi: true }
    Notification.update(conditions, update, options, _)