module.exports = class BaseModule

	constructor: (user) ->
		@DB = require('../DB/knownodeDB')
		@neo4jDB = @DB.getNeo4jDB()
		@user = user or {}
