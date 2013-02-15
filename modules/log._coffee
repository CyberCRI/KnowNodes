module.exports = class Log

	constructor: (user) ->
		@DB = require('../DB/LogDB')
		@user = user or {}

	logActivity: (title, description) =>
		log = new @DB.Log
		log.user = if @user and @user.id then @user.id else "anonymous"
		log.title = title
		log.description = description
		log.save console.log
