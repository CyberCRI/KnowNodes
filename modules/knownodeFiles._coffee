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
fs = require('fs')
postSchema = require('../DB/PostSchema')
config = require('../config/DB.conf')
gridfs = require('../DB/gridFS')

module.exports = class KnownodeFiles extends BaseModule
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
		db.on 'error', callback
		db.on 'open', () ->
			Post = db.model 'Post', postSchema
			callback null, Post

	saveFile: (files, params, _) =>
		Post = @initDB _
		gridfs.get id, _
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
		mongoose.disconnect

	getFile: (id, _) =>
		Post = @initDB _
		gridfs.get id, _