# Serve JSON to the AngularJS client by sending a request
# handles requests for the user

DB = require('../DB/knownodeDB');

# general function to be used as a callback function for the return data from the DB
callBack = (res) ->
  (err, result) ->
    if (err)
      res.json(user: err)
    else
      res.json(user: result)



# GET
exports.index = (req, res) ->
  userList = []
  user = new DB.User

  DB.User.all(limit: 10, (err, result) ->
    if err
      res.json(err)
    else
      userList.push currentUserObj for currentUser, currentUserObj of result
      res.json(users: userList))



# Get for a specific user /user:id
exports.show = (req, res) ->
  userEmail = req.params.email
  callBackRes = callBack(res)
  DB.User.all(where:
    email: userEmail
  , callBackRes)




# POST (create new)
exports.create = (req, res) ->
  callBackRes = callBack(res)
  DB.User.create(req.body, callBackRes)



#Put
exports.edit = (req, res) ->
  userEmail = req.params.email
  callBackRes = callBack(res)
  DB.User.all(where:
    email: userEmail
  , callBackRes)



# update user
exports.update = (req, res) ->
  userEmail = req.params.email
  callBackRes = callBack(res)
  DB.User.all(where:
    email: userEmail
  , callBackRes)


# delete user
exports.delete = (req, res) ->
	userId = req.params.id
	callBackRes = callBack(res);
	DB.User.Delete(where:
		__ID__: userId
	, callBackRes)

