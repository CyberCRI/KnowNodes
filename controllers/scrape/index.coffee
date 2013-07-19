Callback = require('../Callback')
ScrapeController = require('./ScrapeController')

module.exports =

  create: (request, response) ->
    new ScrapeController(request).scrapeUrl(Callback.bind(response))