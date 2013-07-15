Neo4j = require 'neo4j'
DBConf = require '../config/DB.conf'

module.exports = class DB

  constructor: () ->
    @db = new Neo4j.GraphDatabase(DBConf.getDBURL('neo4j'))