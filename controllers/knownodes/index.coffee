###
* This is the routing/controller for the knownodes.
* It uses /modules/knownode.js for implementing its actions.
###
knownodeModule = require('../../modules/knownode')
relationModule = require('../../modules/relation')
baseController = require('../baseController')
commentModule = require('../../modules/comment')
txtwiki = require('../../modules/txtwiki.js')
bot = require('nodemw');

client = new bot
  server: 'en.wikipedia.org', # host name of MediaWiki-powered site
  path: '/w',                 # path to api.php script
  debug: false                # is more verbose when set to true

getFirstParagraph = (title, callback) ->
  client.getArticle title, (data) ->
    callback(txtwiki.parseWikitext(data.substring(0,data.indexOf("\n\n"))))

module.exports =
  show: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    id = request.params.knownode.replace /:/g, ''
    modKnownode.getKnownodeByKnownodeId id, cb

  create: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    if request.body.knownodeRelation and request.body.knownodeRelation.reversedDirection and request.body.existingNode?
      originalPostId = request.body.originalPostId.replace /:/g, ''
      modKnownode.createNewReversedRelationBetweenExistingNodes originalPostId, request.body.knownodeRelation, request.body.existingNode, cb

    else if request.body.knownodeRelation and request.body.existingNode?
      originalPostId = request.body.originalPostId.replace /:/g, ''
      modKnownode.createNewRelationBetweenExistingNodes originalPostId, request.body.knownodeRelation, request.body.existingNode, cb

    else if request.body.knownodeRelation and request.body.knownodeRelation.reversedDirection
      originalPostId = request.body.originalPostId.replace /:/g, ''
      modKnownode.createNewKnownodeWithReversedRelation originalPostId, request.body.knownodeRelation, request.body.knownodeForm, cb

    else if request.body.knownodeRelation
      originalPostId = request.body.originalPostId.replace /:/g, ''
      modKnownode.createNewKnownodeWithRelation originalPostId, request.body.knownodeRelation, request.body.knownodeForm, cb

    else
      modKnownode.createNewKnownode request.body.knownodeForm, cb

  destroy: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    id = request.params.knownode.replace /:/g, ''
    modKnownode.destroy id, cb

  search: (request, response) ->
    cb = baseController.callBack response

  getUserKnownodes: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    modKnownode.getUserKnownodes cb

  getRelatedKnownodes: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    id = request.params.knownode.replace /:/g, ''
    modKnownode.getRelatedKnownodesToKnowNodeId id, cb

  getRelatedComments: (request, response) ->
    cb = baseController.callBack response
    comment = new commentModule request.user
    id = request.params.knownode.replace /:/g, ''
    comment.getAllComments id, cb

  getNodesByKeyword: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    id = request.params.knownode.replace /:/g, ''
    modKnownode.getNodesToKeyword id, cb

  # Takes a "title" form parameter
  wikinode: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    console.log("Making wikinode")

    url = "http://en.wikipedia.org/wiki/" + request.body.title.replace(" ", "_")
    modKnownode.getKnownodeByUrl url, (err, existingNode) ->
      console.log("modKnownode.getKnownodeByUrl", existingNode)
      if existingNode 
        console.log("Wikinode already exists")
        return cb(null, existingNode)

      getFirstParagraph request.body.title, (description) ->
        knownodeData = 
          title: request.body.title
          bodyText: description
          url: url
        console.log("wikinode data", knownodeData)
        modKnownode.createNewKnownode knownodeData, cb
