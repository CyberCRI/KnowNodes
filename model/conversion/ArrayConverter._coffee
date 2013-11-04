module.exports =

  toGEXF: (array, _) ->
    convertedArray = []
    for element in array
      if not element.hasGexfConverter?()
        throw 'ArrayConverter.toGEXF - Impossible to convert element to GEXF : #{element}'
      convertedElement = element.toGEXF _
      convertedArray.push convertedElement
    convertedArray

  toJSON: (array, _) ->
    convertedArray = []
    for element in array
      if not element.hasJsonConverter?()
        throw 'ArrayConverter.toJSON - Impossible to convert element to JSON : #{element}'
      convertedElement = element.toJSON _
      convertedArray.push convertedElement
    convertedArray