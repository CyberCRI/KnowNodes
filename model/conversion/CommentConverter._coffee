module.exports =

  toJSON: (comment, _) ->
    user = comment.getCreator _
    userJSON = user.toJSON _
    commentJSON = comment.node._data.data
    commentJSON.user = userJSON
    commentJSON