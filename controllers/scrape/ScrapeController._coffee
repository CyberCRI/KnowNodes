Controller = require '../Controller'
Settings = require("../../config/settings")
PageMunch = require 'pagemunch'
PageMunch.set({ key: Settings.getSettings().url_scraper })

module.exports = class ResourceController extends Controller

  constructor: (@request) ->
    super(@request, null)

  scrapeUrl: (_) ->
    url = @request.body.url
    scraped = PageMunch.summary(url, _)
    toReturn =
      title: scraped.name
      body: scraped.description
      image: scraped.image
    toReturn