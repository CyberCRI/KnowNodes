/*** Generated by streamline 0.4.5 (callbacks) - DO NOT EDIT ***/ var __rt=require('streamline/lib/callbacks/runtime').runtime(__filename),__func=__rt.__func,__cb=__rt.__cb; (function() {











  var BaseModule, Comment, relationModule, userModule, __bind = function(fn, me) {
    return function() { return fn.apply(me, arguments); };
  }, __hasProp = { }.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) { child[key] = parent[key]; }; }; function ctor() { this.constructor = child; }; ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseModule = require("./baseModule");

  relationModule = require("./relation");

  userModule = require("./user");

  module.exports = Comment = (function(_super) {

    __extends(Comment, _super);

    function Comment(user) {
      this.createNewComment = __bind(this.createNewComment, this);
      Comment.__super__.constructor.call(this, user);
      this.relation = new relationModule(user); };


    Comment.prototype.queryAndFormatCommentResults = function Comment_prototype_queryAndFormatCommentResults__1(query, queryParams, _) { var comments, user, __this = this; var __frame = { name: "Comment_prototype_queryAndFormatCommentResults__1", line: 34 }; return __func(_, this, arguments, Comment_prototype_queryAndFormatCommentResults__1, 2, __frame, function __$Comment_prototype_queryAndFormatCommentResults__1() {

        user = new userModule;
        comments = [];
        return __this.neo4jDB.query(query, queryParams, __cb(_, __frame, 4, 6, function ___(__0, __2) { return __2.map_(__cb(_, __frame, 4, 6, function __$Comment_prototype_queryAndFormatCommentResults__1() {







            return _(null, comments); }, true), function __1(_, item) { var commentUser; var __frame = { name: "__1", line: 38 }; return __func(_, this, arguments, __1, 0, __frame, function __$__1() { commentUser = user.formatUser(item.commentUser.data); commentUser.id = item.commentUser.id; item.comment.data.id = item.comment.id; item.comment.data.user = commentUser; return _(null, comments.push(item.comment.data)); }); }); }, true)); }); };


    Comment.prototype.getAllComments = function Comment_prototype_getAllComments__2(nodeId, _) { var params, query, __this = this; var __frame = { name: "Comment_prototype_getAllComments__2", line: 49 }; return __func(_, this, arguments, Comment_prototype_getAllComments__2, 1, __frame, function __$Comment_prototype_getAllComments__2() {

        query = ["START root=node({nodeId})","MATCH (root) <-[r:COMMENT_OF*]- (comment) -[u:CREATED_BY]-> (commentUser)","RETURN comment, r, commentUser",].join("\n");
        params = {
          nodeId: nodeId };

        return __this.queryAndFormatCommentResults(query, params, __cb(_, __frame, 6, 13, _, true)); }); };


    Comment.prototype.getAllCommentsOfKnownodeID = function Comment_prototype_getAllCommentsOfKnownodeID__3(knownodeId, _) { var query, queryParams, __this = this; var __frame = { name: "Comment_prototype_getAllCommentsOfKnownodeID__3", line: 58 }; return __func(_, this, arguments, Comment_prototype_getAllCommentsOfKnownodeID__3, 1, __frame, function __$Comment_prototype_getAllCommentsOfKnownodeID__3() {

        queryParams = {
          KN_ID: knownodeId };

        query = ["START root=node(*) ","MATCH (root) <-[r:COMMENT_OF*]- (comment) -[u:CREATED_BY]-> (commentUser)","WHERE root.KN_ID = {KN_ID} ","RETURN comment, r, commentUser",].join("\n");
        return __this.queryAndFormatCommentResults(query, queryParams, __cb(_, __frame, 6, 13, _, true)); }); };


    Comment.prototype.createNewComment = function Comment_prototype_createNewComment__4(commentData, commentedObjectId, _) { var comment, commentedObject, properties, __this = this; var __frame = { name: "Comment_prototype_createNewComment__4", line: 67 }; return __func(_, this, arguments, Comment_prototype_createNewComment__4, 2, __frame, function __$Comment_prototype_createNewComment__4() {

        return __this.DB.Comment.create(commentData, __cb(_, __frame, 2, 16, function ___(__0, __1) { comment = __1;
          __this.relation.createOwnerRelationshipToNode(comment);
          properties = {
            creationDate: new Date() };

          return __this.neo4jDB.query((("START node=node(*) WHERE node.KN_ID='" + commentedObjectId) + "' RETURN node"), __cb(_, __frame, 7, 24, function ___(__0, __2) { commentedObject = __2;
            return __this.relation.createRelation(comment, "COMMENT_OF", commentedObject[0].node, properties, __cb(_, __frame, 8, 6, function __$Comment_prototype_createNewComment__4() {
              return _(null, comment); }, true)); }, true)); }, true)); }); };


    Comment.prototype.createNewCommentToObjectId = function Comment_prototype_createNewCommentToObjectId__5(commentData, commentedObjectId, _) { var commentedObject, queryParams, __this = this; var __frame = { name: "Comment_prototype_createNewCommentToObjectId__5", line: 79 }; return __func(_, this, arguments, Comment_prototype_createNewCommentToObjectId__5, 2, __frame, function __$Comment_prototype_createNewCommentToObjectId__5() {

        queryParams = {
          where: {
            KN_ID: commentedObjectId } };


        return __this.neo4jDB.getNodeById(commentedObjectId, __cb(_, __frame, 7, 24, function ___(__0, __1) { commentedObject = __1;
          return __this.createNewComment(commentData, commentedObject, __cb(_, __frame, 8, 13, _, true)); }, true)); }); };


    return Comment;

  })(BaseModule);

}).call(this);