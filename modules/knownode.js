/*** Generated by streamline 0.4.7 (callbacks) - DO NOT EDIT ***/ var __rt=require('streamline/lib/callbacks/runtime').runtime(__filename),__func=__rt.__func,__cb=__rt.__cb; (function() {











  var DBModule, Knownode, knownodeFile, relationModule, userModule, __hasProp = {
  }.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) { child[key] = parent[key]; }; }; function ctor() { this.constructor = child; }; ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  relationModule = require("./relation");

  userModule = require("./user");

  knownodeFile = require("./knownodeFiles");

  DBModule = require("./DBModule");

  module.exports = Knownode = (function(_super) {

    __extends(Knownode, _super);

    function Knownode(user) {
      Knownode.__super__.constructor.call(this, user);
      this.relation = new relationModule(user);
      this.currentModule = "module/Knownode"; };


    Knownode.prototype.getNodesToKeyword = function Knownode_prototype_getNodesToKeyword__1(UserKeyword, _) { var nodes, params, query, __this = this; var __frame = { name: "Knownode_prototype_getNodesToKeyword__1", line: 35 }; return __func(_, this, arguments, Knownode_prototype_getNodesToKeyword__1, 1, __frame, function __$Knownode_prototype_getNodesToKeyword__1() {

        __this.logger.logDebug(__this.currentModule, ("getNodesToKeyword " + UserKeyword));
        nodes = [];
        query = ["START results=node(*)","Where has(results.title)","and results.nodeType=\"kn_Post\"","and results.title =~ {keyword}","RETURN results",].join("\n");
        UserKeyword = (("(?i).*" + UserKeyword) + ".*");
        params = {
          keyword: UserKeyword };

        return __this.neo4jDB.query(query, params, __cb(_, __frame, 9, 6, function ___(__0, __2) { return __2.map_(__cb(_, __frame, 9, 6, function __$Knownode_prototype_getNodesToKeyword__1() {





            return _(null, nodes); }, true), function __1(_, item) { var __frame = { name: "__1", line: 44 }; return __func(_, this, arguments, __1, 0, __frame, function __$__1() { item.results.data.id = item.results.id; return _(null, nodes.push({ results: item.results.data })); }); }); }, true)); }); };


    Knownode.prototype.getRelatedKnownodesToNodeId = function Knownode_prototype_getRelatedKnownodesToNodeId__2(nodeId, _) { var nodes, params, query, user, __this = this; var __frame = { name: "Knownode_prototype_getRelatedKnownodesToNodeId__2", line: 53 }; return __func(_, this, arguments, Knownode_prototype_getRelatedKnownodesToNodeId__2, 1, __frame, function __$Knownode_prototype_getRelatedKnownodesToNodeId__2() {

        __this.logger.logDebug(__this.currentModule, ("getRelatedKnownodesToNodeId " + nodeId));
        nodes = [];
        query = ["START firstNode=node({startNode})","MATCH (firstNode) -[:RELATED_TO]- (edge) -[:RELATED_TO]- (article) -[:CREATED_BY]- (articleUser),","(edge2)-[?:RELATED_TO]-(article),","(edge) -[:CREATED_BY]- (edgeUser),","(edge) -[?:COMMENT_OF]- (comments)","WHERE article <> firstNode AND edge2 <> edge ","RETURN article, articleUser, edge, edgeUser, count(comments) AS commentCount, count(edge2) AS edgeCount",].join("\n");
        params = {
          startNode: nodeId };

        user = new userModule;
        return __this.neo4jDB.query(query, params, __cb(_, __frame, 9, 6, function ___(__0, __2) { return __2.map_(__cb(_, __frame, 9, 6, function __$Knownode_prototype_getRelatedKnownodesToNodeId__2() {
















            return _(null, nodes); }, true), function __1(_, item) { var articleUser, connectionUser; var __frame = { name: "__1", line: 62 }; return __func(_, this, arguments, __1, 0, __frame, function __$__1() { articleUser = user.formatUser(item.articleUser.data); articleUser.id = item.articleUser.id; item.article.data.id = item.article.id; item.article.data.user = articleUser; connectionUser = user.formatUser(item.edgeUser.data); connectionUser.id = item.edgeUser.id; item.edge.data.id = item.edge.data.id; item.edge.data.user = connectionUser; return _(null, nodes.push({ article: item.article.data, connection: item.edge.data, commentCount: item.commentCount, edgeCount: item.edgeCount })); }); }); }, true)); }); };


    Knownode.prototype.getRelatedKnownodesToKnowNodeId = function Knownode_prototype_getRelatedKnownodesToKnowNodeId__3(knownodeId, _) { var node, __this = this; var __frame = { name: "Knownode_prototype_getRelatedKnownodesToKnowNodeId__3", line: 82 }; return __func(_, this, arguments, Knownode_prototype_getRelatedKnownodesToKnowNodeId__3, 1, __frame, function __$Knownode_prototype_getRelatedKnownodesToKnowNodeId__3() {

        __this.logger.logDebug(__this.currentModule, ("getRelatedKnownodesToKnowNodeId " + knownodeId));
        return __this.getKnownodeByKnownodeId(knownodeId, __cb(_, __frame, 3, 13, function ___(__0, __1) { node = __1;
          return __this.getRelatedKnownodesToNodeId(node.id, __cb(_, __frame, 4, 13, _, true)); }, true)); }); };


    Knownode.prototype.getUserKnownodes = function Knownode_prototype_getUserKnownodes__4(_) { var params, query, __this = this; var __frame = { name: "Knownode_prototype_getUserKnownodes__4", line: 89 }; return __func(_, this, arguments, Knownode_prototype_getUserKnownodes__4, 0, __frame, function __$Knownode_prototype_getUserKnownodes__4() {

        __this.logger.logDebug(__this.currentModule, "getUserKnownodes");
        query = ["START user=node({userId})","MATCH (knownode) -[:CREATED_BY]-> (user)","RETURN knownode",].join("\n");
        params = {
          userId: __this.user.id,
          conceptType: __this.DB.getPostTypes().concept };

        return __this.neo4jDB.query(query, params, __cb(_, __frame, 8, 13, _, true)); }); };


    Knownode.prototype.getKnownodeByKnownodeId = function Knownode_prototype_getKnownodeByKnownodeId__5(knownodeId, _) { var knownode, params, __this = this; var __frame = { name: "Knownode_prototype_getKnownodeByKnownodeId__5", line: 100 }; return __func(_, this, arguments, Knownode_prototype_getKnownodeByKnownodeId__5, 1, __frame, function __$Knownode_prototype_getKnownodeByKnownodeId__5() {

        __this.logger.logDebug(__this.currentModule, ("getKnownodeByKnownodeId " + knownodeId));
        params = {
          where: {
            KN_ID: knownodeId } };


        return __this.DB.Post.all(params, __cb(_, __frame, 8, 17, function ___(__0, __1) { knownode = __1;
          if ((knownode.length > 0)) {
            return _(null, knownode[0]); }
           else {
            return _(null, null); } ; _(); }, true)); }); };



    Knownode.prototype.createNewKnownode = function Knownode_prototype_createNewKnownode__6(knownodeData, _) { var knownode, __this = this; var __frame = { name: "Knownode_prototype_createNewKnownode__6", line: 116 }; return __func(_, this, arguments, Knownode_prototype_createNewKnownode__6, 1, __frame, function __$Knownode_prototype_createNewKnownode__6() {

        __this.logger.logDebug(__this.currentModule, "createNewKnownode");
        return __this.DB.Post.create(knownodeData, __cb(_, __frame, 3, 17, function ___(__0, __1) { knownode = __1;
          return __this.relation.createOwnerRelationshipToNode(knownode, __cb(_, __frame, 4, 6, function __$Knownode_prototype_createNewKnownode__6() {
            return _(null, knownode); }, true)); }, true)); }); };


    Knownode.prototype.createNewKnownodeWithRelation = function Knownode_prototype_createNewKnownodeWithRelation__7(existingNodeId, relationData, newKnownodeData, _) { var edge, existingNode, knownode, __this = this; var __frame = { name: "Knownode_prototype_createNewKnownodeWithRelation__7", line: 124 }; return __func(_, this, arguments, Knownode_prototype_createNewKnownodeWithRelation__7, 3, __frame, function __$Knownode_prototype_createNewKnownodeWithRelation__7() {

        __this.logger.logDebug(__this.currentModule, ("createNewKnownodeWithRelation " + existingNodeId));
        return __this.createNewKnownode(newKnownodeData, __cb(_, __frame, 3, 17, function ___(__0, __1) { knownode = __1;
          return __this.getKnownodeByKnownodeId(existingNodeId, __cb(_, __frame, 4, 21, function ___(__0, __2) { existingNode = __2;
            return __this.relation.addKnownodeEdge(existingNode, relationData, knownode, __cb(_, __frame, 5, 13, function ___(__0, __3) { edge = __3;
              knownode.edge = edge;
              return _(null, knownode); }, true)); }, true)); }, true)); }); };


    Knownode.prototype.createNewKnownodeWithReversedRelation = function Knownode_prototype_createNewKnownodeWithReversedRelation__8(existingNodeId, relationData, newKnownodeData, _) { var edge, existingNode, knownode, __this = this; var __frame = { name: "Knownode_prototype_createNewKnownodeWithReversedRelation__8", line: 134 }; return __func(_, this, arguments, Knownode_prototype_createNewKnownodeWithReversedRelation__8, 3, __frame, function __$Knownode_prototype_createNewKnownodeWithReversedRelation__8() {

        __this.logger.logDebug(__this.currentModule, ("createNewKnownodeWithRelation " + existingNodeId));
        return __this.createNewKnownode(newKnownodeData, __cb(_, __frame, 3, 17, function ___(__0, __1) { knownode = __1;
          return __this.getKnownodeByKnownodeId(existingNodeId, __cb(_, __frame, 4, 21, function ___(__0, __2) { existingNode = __2;
            return __this.relation.addKnownodeEdge(knownode, relationData, existingNode, __cb(_, __frame, 5, 13, function ___(__0, __3) { edge = __3;
              knownode.edge = edge;
              return _(null, knownode); }, true)); }, true)); }, true)); }); };


    Knownode.prototype.destroy = function Knownode_prototype_destroy__9(id, _) { var kn_File, knownode, params, query, __this = this; var __frame = { name: "Knownode_prototype_destroy__9", line: 144 }; return __func(_, this, arguments, Knownode_prototype_destroy__9, 1, __frame, function __$Knownode_prototype_destroy__9() {

        __this.logger.logDebug(__this.currentModule, ("destroy " + id));
        query = ["START user=node({userId}), n=node({nodeId})","MATCH ()-[r]-n-[:CREATED_BY]-(user)","RETURN n",].join("\n");
        console.log(("user is" + __this.user.id));
        params = {
          userId: __this.user.id,
          nodeId: id };

        return __this.neo4jDB.query(query, params, __cb(_, __frame, 9, 17, function ___(__0, __1) { knownode = __1;
          console.log(("Deleting file " + knownode.fileId));
          kn_File = new knownodeFile(__this.user);
          return kn_File.deleteFile(knownode.fileId, __cb(_, __frame, 12, 6, function __$Knownode_prototype_destroy__9() {
            console.log("File deleted");
            return _(null, query = ["START user=node({userId}), n=node({nodeId})","MATCH ()-[r]-n-[:CREATED_BY]-(user)","DELETE n",].join("\n")); }, true)); }, true)); }); };


    return Knownode;

  })(DBModule);

}).call(this);