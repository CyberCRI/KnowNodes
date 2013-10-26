Logger = require '../log/Logger'
Error = require '../error/Error'

module.exports =

  bind: (response) ->
    return (error, result) ->

      getLogger = ->
        new Logger('Callback')

      handleCustomError = (error, response) ->
        switch error.type
          when Error.Type.BAD_REQUEST
            getLogger().info(error.message)
            response.json(400, error.message)
          when Error.Type.UNAUTHORIZED
            getLogger().info(error.message)
            response.json(401, error.message)
          when Error.Type.FORBIDDEN
            getLogger().info(error.message)
            response.json(403, error.message)
          when Error.Type.NOT_FOUND
            getLogger().info(error.message)
            response.json(404, error.message)
          else
            getLogger().error(error)
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