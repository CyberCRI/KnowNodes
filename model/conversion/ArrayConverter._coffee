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
      if element.hasJsonConverter?()
        convertedElement = element.toJSON _
        convertedArray.push convertedElement
      else if element.constructor.name is 'model' # Mongoose Model
        convertedArray.push element
      else
        console.log 'WARNING - ArrayConverter.toJSON() : No strategy to convert this element', element
        convertedArray.push element
    convertedArray