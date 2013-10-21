Neo4j = require 'neo4j'
DBConf = require '../config/DB.conf.js'

module.exports = class GraphDB

  @DB = new Neo4j.GraphDatabase(DBConf.getDBURL('neo4j'))

  @get: -> @DB