###
* This is the routing/controller for the knownodes.
* It uses /modules/knownode.js for implementing its actions.
###
knownodeModule = require('../../modules/knownode')
relationModule = require('../../modules/relation')
baseController = require('../baseController')
commentModule = require('../../modules/comment')

module.exports =
  show: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    id = request.params.knownode.replace /:/g, ''
    modKnownode.getKnownodeByKnownodeId id, cb

  create: (request, response) ->
    cb = baseController.callBack response
    modKnownode = new knownodeModule request.user
    if request.body.knownodeRelation and request.body.knownodeRelation.reversedDirection
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