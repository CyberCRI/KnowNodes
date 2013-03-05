/*** Generated by streamline 0.4.5 (callbacks) - DO NOT EDIT ***/ var __rt=require('streamline/lib/callbacks/runtime').runtime(__filename),__func=__rt.__func,__cb=__rt.__cb; (function() {











  var BaseModule, KnownodeFiles, config, gridfs, mongoose, postSchema, userModule, __bind = function(fn, me) {
    return function() { return fn.apply(me, arguments); };
  }, __hasProp = { }.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) { child[key] = parent[key]; }; }; function ctor() { this.constructor = child; }; ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseModule = require("./baseModule");

  userModule = require("./user");

  mongoose = require("mongoose");

  postSchema = require("../DB/PostSchema");

  config = require("../config/DB.conf");

  gridfs = require("../DB/gridFS");

  module.exports = KnownodeFiles = (function(_super) {
    var gfs;

    __extends(KnownodeFiles, _super);

    gfs = null;

    function KnownodeFiles(user) {
      this.getFile = __bind(this.getFile, this);

      this.saveFile = __bind(this.saveFile, this);
      KnownodeFiles.__super__.constructor.call(this, user); };


    KnownodeFiles.prototype.initDB = function(callback) {
      var db, dbURL, opts;
      opts = {
        server: {
          auto_reconnect: false,
          user: config.getDBDetails("mongoDB").user,
          pass: config.getDBDetails("mongoDB").pass } };


      dbURL = config.getDBURL("mongoDB").url;
      mongoose.connect(dbURL, opts);
      db = mongoose.connection;
      db.on("error", function(err) {
        try {
          mongoose.connection.close();
          return callback(err);
        } catch (error) {
          console.log(error);
          return callback(error); }; });


      return db.once("open", function() {
        var Post;
        console.log("db is open");
        Post = db.model("Post", postSchema);
        console.log("sending Post");
        return callback(null, Post); }); };



    KnownodeFiles.prototype.saveFile = function KnownodeFiles_prototype_saveFile__1(files, params, _) { var Post, filepost, opts, post, __this = this; var __frame = { name: "KnownodeFiles_prototype_saveFile__1", line: 74 }; return __func(_, this, arguments, KnownodeFiles_prototype_saveFile__1, 2, __frame, function __$KnownodeFiles_prototype_saveFile__1() {

        return __this.initDB(__cb(_, __frame, 2, 13, function ___(__0, __1) { Post = __1;
          console.log("post initialized");
          post = new Post({
            fileURL: params.url,
            fileName: files.uploadedFile.name,
            abstract: params.bodyText,
            title: params.title,
            meta: {
              uploaderId: __this.user.id,
              uploaderEmail: __this.user.email,
              size: files.uploadedFile.size } });


          opts = {
            content_type: files.uploadedFile.type };

          return post.save(__cb(_, __frame, 18, 17, function ___(__0, __2) { filepost = __2;
            return filepost.addFile(files.uploadedFile, opts, __cb(_, __frame, 19, 6, function __$KnownodeFiles_prototype_saveFile__1() {
              mongoose.connection.close();
              return _(null, filepost); }, true)); }, true)); }, true)); }); };


    KnownodeFiles.prototype.getFile = function KnownodeFiles_prototype_getFile__2(id, _) { var Post, __this = this; var __frame = { name: "KnownodeFiles_prototype_getFile__2", line: 98 }; return __func(_, this, arguments, KnownodeFiles_prototype_getFile__2, 1, __frame, function __$KnownodeFiles_prototype_getFile__2() {

        return __this.initDB(__cb(_, __frame, 2, 13, function ___(__0, __1) { Post = __1;
          return gridfs.get(id, __cb(_, __frame, 3, 13, _, true)); }, true)); }); };


    return KnownodeFiles;

  })(BaseModule);

}).call(this);