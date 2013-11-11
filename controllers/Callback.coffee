Logger = require '../log/Logger'
Error = require '../error/Error'
ArrayConverter = require '../model/conversion/ArrayConverter'
jstoxml = require 'jstoxml'

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
        if not result
          response.send('OK')
        else if result.hasJsonConverter?()
          result.toJSON( (error, json) -> response.json(json) )
        else if result.constructor is Array
          ArrayConverter.toJSON(result, (error, convertedArray) -> response.json(convertedArray) )
        else if result._name is 'gexf'
          xml = jstoxml.toXML(result, { header: true, indent: '  ' })
          response.send(xml)
        else if result.constructor is String
          response.send(result)
        else
          response.json(result)