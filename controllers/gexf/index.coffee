Callback = require('../Callback')
GexfController = require('./GexfController')

module.exports =

  index: (request, response) ->
    new GexfController(request).getSampleXML(Callback.bind(response))
