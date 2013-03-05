###
* User: Liad Magen
* Date: 11/02/13
* Time: 17:15
*
* Knownode files module. for saving / retriving the file articles for knownode from MongoDB
*
#####

BaseModule = require './baseModule'
userModule = require('./user')
mongoose = require('mongoose')
postSchema = require('../DB/PostSchema')
config = require('../config/DB.conf')
gridfs = require('../DB/gridFS')

module.exports = class KnownodeFiles extends BaseModule
	gfs = null

	constructor: (user) ->
		super user

	initDB: (callback) ->
		opts =
			server:
				auto_reconnect: false,
				user: config.getDBDetails('mongoDB').user,
				pass: config.getDBDetails('mongoDB').pass
		dbURL = config.getDBURL('mongoDB').url
		mongoose.connect dbURL, opts
		db = mongoose.connection
		db.on 'error', (err) ->
			try
				mongoose.connection.close()
				callback err
			catch error
				console.log error
				callback error

		db.once 'open', () ->
			console.log 'db is open'
			Post = db.model 'Post', postSchema
			console.log 'sending Post'
			callback null, Post

	saveFile: (files, params, _) =>
		Post = @initDB _
		console.log 'post initialized'
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

		filepost = post.save _
		filepost.addFile files.uploadedFile, opts, _
		mongoose.connection.close()

		filepost

	getFile: (id, _) =>
		Post = @initDB _
		gridfs.get id, _