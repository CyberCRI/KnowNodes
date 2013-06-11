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

# Get the object being the first key/value entry of a given object
getFirstItem = (object) -> for key, value of object then return value

makeWikipediaUrl = (title) -> 
 return "http://en.wikipedia.org/wiki/" + title.replace(" ", "_")

makeLinksToUrls = (modKnownode, nodeId, urls, relationData) ->
  for url in urls
    modKnownode.getKnownodeByUrl url, (err, otherNode) ->
      if not otherNode then return

      console.log("Creating link from node #{nodeId} to #{otherNode.KN_ID}")
      modKnownode.createNewRelationBetweenExistingNodes nodeId, relationData, otherNode.KN_ID, (err, link) ->
        if err then console.log("Error creating link", err) 
        else console.log("Created link", link.KN_ID) 

getInternalLinks = (title, callback) ->
  query =
    action: 'query'
    prop: 'links'
    titles: title
    pllimit: 5000
  client.api.call query, (data) -> 
    titles = (link.title for link in getFirstItem(data.pages).links)
    callback(titles)

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
    RELATION_DATA = 
      connectionType: "Wikipedia Link"

    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    console.log("Making wikinode")

    console.log("title = ", request.body.title)
    url = makeWikipediaUrl(request.body.title)
    console.log("url = ", url)
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
        modKnownode.createNewKnownode knownodeData, (err, newNode) ->
          getInternalLinks request.body.title, (linkedTitles) ->
            urls = (makeWikipediaUrl(linkedTitle) for linkedTitle in linkedTitles)
            makeLinksToUrls(modKnownode, newNode.KN_ID, urls, RELATION_DATA)

          return cb(null, newNode)


