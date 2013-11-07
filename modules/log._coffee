BaseModule = require './baseModule'
LogDB = require '../DB/LogDB'
loggly = require 'loggly'

module.exports = class Log extends BaseModule

  constructor: (user) ->
    super user
    @currentStage = 3
    config =
      auth:
        username: "dorgarbash"
        password: "dorIsGarbash1"
      subdomain: "libreop"

    @client = loggly.createClient config

  saveLogToDB: (title, content) =>
    @client.log '0bf69f08-e6f2-4c42-8f39-4b5a606c8c90', "#{title}: #{content}"

  logActivity: (title, content, _) =>
    title = "Activity: #{title}"
    console.log title + '-' + content
    if @currentStage > 2
      @saveLogToDB title, content

  logError: (title, content, _) =>
    title = "ERROR: #{title}"
    console.log title + '-' + content
    @saveLogToDB title, content

  logDebug: (title, content, _) =>
    title = "DEBUG: #{title}"
    console.log title + '-' + content
    if @currentStage > 1
      @saveLogToDB title, content