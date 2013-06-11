BaseModule = require './baseModule'
LogDB = require '../DB/LogDB'

module.exports = class Log extends BaseModule

	constructor: (user) ->
		super user
		@currentStage = 3

	logActivity: (title, content, _) =>
	    title = "Activity: #{title}"
	    console.log title + '-' + content
	    if @currentStage > 2
            log = new LogDB.Log
            log.user = if @user and @user.id then @user.id else "anonymous"
            log.title = title
            log.content = content
            log.save console.log

	logError: (title, content, _) =>
        title = "ERROR: #{title}"
        console.log title + '-' + content
        log = new LogDB.Log
        log.user = if @user and @user.id then @user.id else "anonymous"
        log.title = title
        log.content = content
        log.save console.log

	logDebug: (title, content, _) =>
	    title = "DEBUG: #{title}"
	    console.log title + '-' + content
	    if @currentStage > 1
            log = new LogDB.Log
            log.user = if @user and @user.id then @user.id else "anonymous"
            log.title = title
            log.content = content
            log.save console.log