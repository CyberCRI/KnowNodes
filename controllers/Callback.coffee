Logger = require '../log/logger'
Error = require '../error/Error'

module.exports =

  bind: (response) ->
    return (error, result) ->

      getLogger = ->
        new Logger('ControllerUtil')

      handleCustomError = (error, response) ->
        switch error.type
          when Error.Type.ENTITY_NOT_FOUND
            getLogger().info(error.message)
            response.json(404, error.message)
          when Error.Type.UNAUTHORIZED_OPERATION
            getLogger().info(error.message)
            response.json(401, error.message)
          else
            getLogger().error(error.message)
            response.json(500, error.message)

      handleError = (error, response) ->
        if error.isCustom?
          handleCustomError(error, response)
        else
          getLogger().error(error)
          response.json(500, error)

      if error
        handleError(error, response)
      else
        if result.node?
          response.json(result.node._data.data)
        else
          response.json(result)