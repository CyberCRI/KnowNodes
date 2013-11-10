NodeValidator = require './nodeValidator'
Type = require '../Type'

module.exports = class ResourceValidator extends NodeValidator

  constructor: () ->
    super Type.RESOURCE

  validate: (data, _) ->
    super data
    @check(data.__CreatedOn__).notNull().isInt()
    @check(data.title).notEmpty()
    data.active = @sanitize(data.active).toBoolean()
    console.log Type.WIKIPEDIA_ARTICLE
    if data.url? or data.resourceType is Type.WIKIPEDIA_ARTICLE
      @check(data.url).isUrl()