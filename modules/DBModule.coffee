BaseModule = require './baseModule'
LOG = require './log'

module.exports = class DBModule extends BaseModule

	constructor: (user) ->
		@logger = new LOG user
		super user