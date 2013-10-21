NodeValidator = require './NodeValidator'
Type = require '../Type'

module.exports = class ResourceValidator extends NodeValidator

  constructor: () ->
    super Type.RESOURCE

  validate: (data, _) ->
    super data
    @check(data.__CreatedOn__).notNull().isInt()
    @check(data.title).notEmpty()
    data.active = @sanitize(data.active).toBoolean()
    if data.url? or data.resourceType is Type.WIKIPEDIA_ARTICLE
      @check(data.url).isUrl()