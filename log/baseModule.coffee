cache = require('memory-cache')

###
TODO Delete (duplicate of GraphElement)
###
module.exports = class BaseModule

	constructor: (user) ->
		@DB = require('../DB/knownodeDB')
		@neo4jDB = @DB.getNeo4jDB()
		if user and user.id
			@user = cache.get 'USER_' + user.id
			if not @user?
				@neo4jDB.getNodeById user.id, (err, usr) =>
					if not err?
						cache.put('USER_' + user.id, usr, 1000)
						@user = usr
		else
			@user = user or {}
