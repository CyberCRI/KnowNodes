(function() {
  var DBConf, GraphDB, Neo4j;

  Neo4j = require('neo4j');

  DBConf = require('../config/DB.conf.js');

  module.exports = GraphDB = (function() {
    function GraphDB() {}

    GraphDB.DB = new Neo4j.GraphDatabase(DBConf.getDBURL('neo4j'));

    GraphDB.get = function() {
      return this.DB;
    };

    return GraphDB;

  })();

}).call(this);
