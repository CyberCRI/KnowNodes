/*** Generated by streamline 0.4.7 (callbacks) - DO NOT EDIT ***/ var __rt=require('streamline/lib/callbacks/runtime').runtime(__filename),__func=__rt.__func; (function() {
  var BaseModule, Log, LogDB, __bind = function(fn, me) {
    return function() { return fn.apply(me, arguments); };
  }, __hasProp = { }.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) { child[key] = parent[key]; }; }; function ctor() { this.constructor = child; }; ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseModule = require("./baseModule");

  LogDB = require("../DB/LogDB");

  module.exports = Log = (function(_super) {
    __extends(Log, _super);

    function Log(user) {
      this.logDebug = __bind(this.logDebug, this);
      this.logError = __bind(this.logError, this);
      this.logActivity = __bind(this.logActivity, this);
      Log.__super__.constructor.call(this, user);
      this.currentStage = 3; };


    Log.prototype.logActivity = function Log_prototype_logActivity__1(title, content, _) { var log, __this = this; var __frame = { name: "Log_prototype_logActivity__1", line: 22 }; return __func(_, this, arguments, Log_prototype_logActivity__1, 2, __frame, function __$Log_prototype_logActivity__1() {

        title = ("Activity: " + title);
        console.log(((title + "-") + content));
        if ((__this.currentStage > 2)) {
          log = new LogDB.Log;
          log.user = ((__this.user && __this.user.id) ? __this.user.id : "anonymous");
          log.title = title;
          log.content = content;
          return _(null, log.save(console.log)); } ; _(); }); };



    Log.prototype.logError = function Log_prototype_logError__2(title, content, _) { var log, __this = this; var __frame = { name: "Log_prototype_logError__2", line: 35 }; return __func(_, this, arguments, Log_prototype_logError__2, 2, __frame, function __$Log_prototype_logError__2() {

        title = ("ERROR: " + title);
        console.log(((title + "-") + content));
        log = new LogDB.Log;
        log.user = ((__this.user && __this.user.id) ? __this.user.id : "anonymous");
        log.title = title;
        log.content = content;
        return _(null, log.save(console.log)); }); };


    Log.prototype.logDebug = function Log_prototype_logDebug__3(title, content, _) { var log, __this = this; var __frame = { name: "Log_prototype_logDebug__3", line: 46 }; return __func(_, this, arguments, Log_prototype_logDebug__3, 2, __frame, function __$Log_prototype_logDebug__3() {

        title = ("DEBUG: " + title);
        console.log(((title + "-") + content));
        if ((__this.currentStage > 1)) {
          log = new LogDB.Log;
          log.user = ((__this.user && __this.user.id) ? __this.user.id : "anonymous");
          log.title = title;
          log.content = content;
          return _(null, log.save(console.log)); } ; _(); }); };



    return Log;

  })(BaseModule);

}).call(this);