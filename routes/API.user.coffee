# Serve JSON to the AngularJS client by sending a request
# handles requests for the user

DB = require('../DB/knownodeDB')

# general function to be used as a callback function for the return data from the DB
callBack = (res) ->
	(err, result) ->
		if err
			res.json user: err
		else
			res.json user: result

exports.index = (req, res) ->
	userList = []
	users = DB.User.all(limit: 10, _).forEach_ _, (_, currentUser) ->
		userList.push currentUserObj
	res.json success: userList

exports.show = (req, res) ->
	callBackRes = undefined
	userEmail = undefined
	userName = undefined
	userId = undefined
	userEmail = req.params.email
	userName = req.params.name
	userId = req.params.KN_ID
	callBackRes = callBack(res)
	if userEmail
		return DB.User.all(
			where:
				email: userEmail
		, callBackRes)
	if userId
		return DB.User.all(
			where:
				KN_ID: userId
		, callBackRes)
	DB.getUsersByName userName, callBackRes  if userName

exports.create = (req, res) ->
	callBackRes = undefined
	callBackRes = callBack(res)
	DB.User.create req.body, callBackRes

exports.edit = (req, res) ->
	callBackRes = undefined
	userEmail = undefined
	userEmail = req.params.email
	callBackRes = callBack(res)
	DB.User.all
		where:
			email: userEmail
	, callBackRes

exports.update = (req, res) ->
	callBackRes = undefined
	userEmail = undefined
	userEmail = req.params.email
	callBackRes = callBack(res)
	DB.User.all
		where:
			email: userEmail
	, callBackRes

exports.destroy = (req, res) ->
	callBackRes = undefined
	userId = undefined
	userId = req.params.user.substring(1)
	callBackRes = callBack(res)
	DB.User.find userId, (err, user) ->
		return res.json(err)  if err
		user.destroy callBackRes


exports.load = (id, fn) ->
	params = id.split("=")
	q = params[0]
	val = (if params.length > 1 then params[1] else q)
	cb = (error, user) ->
		process.nextTick ->
			fn error, user


	switch q
		when "email"
			DB.User.all
				where:
					email: val
			, cb
		when "guid"
			DB.User.all
				where:
					KN_ID: val
			, cb
		when "name"
			DB.getUsersByName val, cb
		else
			DB.User.find val, cb