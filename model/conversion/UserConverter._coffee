module.exports =

  toJSON: (user, _) ->
    json = user.node._data.data
    delete json.dateOfBirth
    delete json.email
    delete json.__CreatedOn__
    delete json.password
    json