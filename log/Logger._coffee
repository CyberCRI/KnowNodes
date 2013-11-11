LogDB = require '../DB/LogDB'
Loggly = require 'loggly'
LogglyConf = require '../config/loggly.conf'

module.exports = class Logger

  constructor: (source) ->
    @source = source
    # TODO Remove magic number
    @currentStage = 3
    @logglyLogger = Loggly.createClient LogglyConf.getLogglyConf()

  log: (level, content) ->
    message = "#{level}: #{@source} - #{content}"
    console.log message
    @logglyLogger.log '0bf69f08-e6f2-4c42-8f39-4b5a606c8c90', message

  error: (content, _) ->
    @log "ERROR", content

  warning: (content, _) ->
    if @currentStage > 0
      @log "WARNING", content

  info: (content, _) ->
    if @currentStage > 1
      @log "INFO", content

  debug: (content, _) ->
    if @currentStage > 2
      @log "DEBUG", content