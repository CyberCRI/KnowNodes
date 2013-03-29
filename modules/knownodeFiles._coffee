###
* User: Liad Magen
* Date: 11/02/13
* Time: 17:15
*
* Knownode files module. for saving / retriving the file articles for knownode from MongoDB
*
#####

userModule = require('./user')
mongoose = require('mongoose')
postSchema = require('../DB/PostSchema')
config = require('../config/DB.conf')
DBModule = require './DBModule'

module.exports = class KnownodeFiles extends DBModule

	constructor: (user) ->
		super user
		@currentModule = 'module/KnownodeFiles'

	initDB: (callback) ->
		@logger.logDebug @currentModule, 'initDB'
		opts =
			server:
				auto_reconnect: false,
				user: config.getDBDetails('mongoDB').user,
				pass: config.getDBDetails('mongoDB').pass
		dbURL = config.getDBURL('mongoDB').url
		mongoose.connect dbURL, opts
		db = mongoose.connection
		db.on 'error', (err) ->
			@logger.logError @currentModule, err
			try
				mongoose.disconnect()
				#mongoose.connection.close()
				callback err
			catch error
				@logger.logError @currentModule, error
				callback error

		db.once 'open', () ->
			console.log 'db is open'
			Post = db.model 'Post', postSchema
			console.log 'sending Post'
			callback null, Post

	saveFile: (files, params, _) =>
		@logger.logDebug @currentModule, 'saveFile'
		Post = @initDB _
		@logger.logDebug @currentModule, 'post initialized'
		post = new Post
			fileURL: params.url,
			fileName: files.uploadedFile.name,
			abstract: params.bodyText,
			title: params.title,
			meta:
				uploaderId: @user.id,
				uploaderEmail: @user.email,
				size: files.uploadedFile.size
		opts =
			content_type: files.uploadedFile.type

		#filepost = post.save _
		post.addFile files.uploadedFile, opts, _
		mongoose.disconnect()
		#mongoose.connection.close()

		post

	getFile: (id, _) =>
		@logger.logDebug @currentModule, "getFile #{id}"
		Post = @initDB _
		post = new Post()
		post.getFile id, _

	sendFileToStreamHandler: (response, id)->
		@logger.logDebug @currentModule, "sendFileToStreamHandler #{id}"
		@getFile id, (err, store)->
			if err?
				response.json error: err
			else
				response.writeHead 200,
					'Content-Type': store.contentType,
					'Content-Length': store.length,
					'Content-disposition': 'attachment; filename=' + store.filename

				fileStream = store.stream(false)
				fileStream.pipe response,
					end:false

				fileStream.on "end", () ->
					#fileStream.end()
					mongoose.connection.close()

	deleteFile: (id, _) =>
		@logger.logDebug @currentModule, "deleteFile #{id}"
		Post = @initDB _
		post = new Post()
		post.deleteFile id, _
		mongoose.connection.close()