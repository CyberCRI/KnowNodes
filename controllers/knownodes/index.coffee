###
* This is the routing/controller for the knownodes.
* It uses /modules/knownode.js for implementing its actions.
###
knownodeModule = require('../../modules/knownode')
relationModule = require('../../modules/relation')
baseController = require('../baseController')
commentModule = require('../../modules/comment')
bot = require('../../bundledModules/nodemw')
request = require('request')

client = new bot
  server: 'en.wikipedia.org', # host name of MediaWiki-powered site
  path: '/w',                 # path to api.php script
  debug: false                # is more verbose when set to true

getFirstParagraph = (title, callback) ->
  params = 
    action: 'parse'
    page:title
    prop: 'text'
  client.api.call params, (data) ->
    regex = /<p>.+<\/p>/
    match = regex.exec data.text['*']
    callback match[0]

# Get the object being the first key/value entry of a given object
getFirstItem = (object) -> for key, value of object then return value

makeWikipediaUrl = (title) -> 
  return "http://en.wikipedia.org/wiki/" + title.replace(/\ /g, "_")

makeCallbackJoin = (count, onDone) -> 
  counter = 0
  return -> if ++counter == count then onDone()

makeLinksToUrls = (modKnownode, nodeId, urls, relationData, reverseDirection, callback) ->
  if urls.length == 0 then return callback()

  onDone = makeCallbackJoin urls.length, callback
  for url in urls
    modKnownode.getKnownodeByUrl url, (err, otherNode) ->
      if not otherNode then return onDone()

      startNodeId = if reverseDirection then otherNode.KN_ID else nodeId
      endNodeId = if reverseDirection then nodeId else otherNode.KN_ID 
      console.log("Creating link from node #{startNodeId} to #{endNodeId}")
      modKnownode.createNewRelationBetweenExistingNodes startNodeId, relationData, endNodeId, (err, link) ->
        if err then console.log("Error creating link", err) 
        else console.log("Created link", link.KN_ID) 
        onDone()

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
    console.log("IN SHOW")
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

  getResourceByUrl: (request, response) ->
    console.log("IN getResourceByUrl()")
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    modKnownode.getKnownodeByUrl request.body.url, (err, existingNode) ->
      if existingNode
        return cb(null, existingNode)
      else
        return cb("No node for this URL")      

  # Takes a "title" form parameter
  wikinodeIfExists: (req, resp) ->
    cb = baseController.callBack resp
    modKnownode = new knownodeModule req.user
    url = makeWikipediaUrl(req.body.title)
    modKnownode.getKnownodeByUrl url, (err, existingNode) ->
      if existingNode
        return cb(null, existingNode)
      else
        return cb("No wikinode for this Wikipedia article")

  # Takes a "title" form parameter
  wikinode: (req, resp) ->
    RELATION_DATA = 
      connectionType: "Wikipedia Link"

    cb = baseController.callBack resp
    modKnownode = new knownodeModule req.user
    console.log("Making wikinode")

    console.log("title = ", req.body.title)
    url = makeWikipediaUrl(req.body.title)
    console.log("url = ", url)
    modKnownode.getKnownodeByUrl url, (err, existingNode) ->
      if existingNode
        console.log("Wikinode already exists")
        return cb(null, existingNode)

      request.get url, (err, response) ->
        if response.statusCode != 200
          return cb("No such Wikipedia page")
        else
          console.log("Wikipedia page exists")
          getFirstParagraph req.body.title, (description) ->
            knownodeData =
              title: req.body.title
              bodyText: description
              url: url
            console.log("wikinode data", knownodeData)

            modKnownode.createNewKnownode knownodeData, (err, newNode) ->
              return cb(null, newNode)


#           VERSION WITH ACTIVE IMPORT OF LINKED WIKIPEDIA ARTICLES
#            modKnownode.createNewKnownode knownodeData, (err, newNode) ->
#              onDone = makeCallbackJoin 3, -> cb(null, newNode)
#
#              getInternalLinks req.body.title, (linkedTitles) ->
#                urls = (makeWikipediaUrl(linkedTitle) for linkedTitle in linkedTitles)
#                makeLinksToUrls(modKnownode, newNode.KN_ID, urls, RELATION_DATA, false, onDone)
#              client.getExternalLinks req.body.title, (externalLinks) ->
#                urls = (link["*"] for link in externalLinks when link["*"].indexOf("http://") == 0)
#                makeLinksToUrls(modKnownode, newNode.KN_ID, urls, RELATION_DATA, false, onDone)
#              client.getBacklinks req.body.title, (backlinks) ->
#                urls = (makeWikipediaUrl(link.title) for link in backlinks)
#                makeLinksToUrls(modKnownode, newNode.KN_ID, urls, RELATION_DATA, true, onDone)

