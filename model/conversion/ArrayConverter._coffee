module.exports =

  toJSON: (array, _) ->
    convertedArray = []
    for element in array
      if element.hasConverter?()
        convertedElement = element.toJSON _
        convertedArray.push convertedElement
      else
        convertedArray.push element
    convertedArray