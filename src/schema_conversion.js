const isArray = (item) => {
  return (item && typeof item === 'object' && Array.isArray(item))
}


const isObject = (item) => {
  return (item && typeof item === 'object' && !Array.isArray(item))
}


const isYupSchema = (input, config) => {

  if (typeof input !== 'object') {
    throw new Error('Input schema must be an object')
  }

  if(config.enforceYupSchema) {
    config.yupSchema.forEach( (prop) => {
      if(!Object.prototype.hasOwnProperty.call(input, prop)){
        throw new Error(`Yup schemas should have '${prop}' property defined`)
      }
    })
  }

  return true
}


const mergeObjects = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) target[key] = {}
        mergeObjects(target[key], source[key])
      } 
      else if (isArray(source[key]) && isArray(target[key])) {
        target[key] = target[key].concat(source[key]) 
      }
      else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeObjects(target, ...sources);
}


const getFirstMatch = (needle, haystack) => {
  let result = haystack.find( test => {
    return needle === test.OPTIONS.name
  })
  
  if (result)
    return field.OPTIONS.name
}


const findFirstMatchingConditionKey = (name, yupField) => {
  let matchingCondition = yupField._conditions.find( condition => {
    if(condition.refs.length)
      return name === condition.refs[0].key
    return false
  })
  return (matchingCondition) ? matchingCondition.refs[0].key : null
}


const getType = (yupField, config) => {
  let searchArr = config.yupToSwaggerType[yupField._type]
  if(!searchArr) {
    throw new Error(`"${yupField._type}" type support must be added manually. At a minimum, add "null" as first array element.`)
  }

  let testResults = searchTests(yupField, searchArr, config)
  result = (testResults.length) ? testResults[0][0] : null

  //default value is null, should be first element in searchArr
  return { type: result || searchArr[0], yupType: yupField._type }
}


const getFormat = (yupField, config) => {
  let format
  let testResults = searchTests(
    yupField,
    config.yupToSwaggerFormat[yupField._type] || [],
    config
  )

  if(!testResults.length) {
    //check field conditions if no format derived from field tests 
    let conditionFormat = Object.entries(config.yupConditionKeyToSwaggerFormat)
      .find( (arrElement) => {
        return findFirstMatchingConditionKey(arrElement[0], yupField)
      })

    format = (conditionFormat) ? conditionFormat[1] : config.yupToSwaggerFormat[yupField._type][0]
  }
  else {
    format = testResults[0][0]
  }

  return format
}


const getMiscAttributes = (yupField, config, yupType) => {
  let searchArr = Object.keys(config.yupToSwaggerConditions[yupType] || {})
  let testResults = searchTests(yupField, searchArr, config)
    .map( arr => {
      return [config.yupToSwaggerConditions[yupType][arr[0]], arr[1]]
    })
  return testResults
}


const searchTests = (yupField, searchArr, config) => {
  return searchArr.map( (searchTerm) => {
    let value
    let matchingTest = yupField.tests
      .find( test => {
        return searchTerm === test.OPTIONS.name
      })

    if(matchingTest) {
      value = (matchingTest.OPTIONS.params) ? Object.entries(matchingTest.OPTIONS.params)[0][1] : true
      return [ searchTerm, value ]
    }
  }).filter( x => typeof x !== 'undefined' )
}

const getNullable = (yupField, config) => {
  return (yupField._nullable) ? yupField._nullable : null
}


const getDefault = (yupField, config) => {
  return (yupField._default) ? yupField._default : null
}


const getProps = (name, schema, config) => {
  let result = {}
  let { type, yupType } = getType(schema, config)
  let format = getFormat(schema, config)
  let miscAttrs = getMiscAttributes(schema, config, yupType)
  let nullable = getNullable(schema, config)
  let _default = getDefault(schema, config)
  let required = false

  result.type = type
  if (format)  result.format = format
  if (nullable)  result.nullable = nullable
  if (_default)  {
    result.default = (typeof _default === 'function') ? _default() : _default
  }
  if (miscAttrs.length) miscAttrs.forEach( arr => {
    result[arr[0]] = arr[1]
  })

  return  { [name] : result }
}


const propsToSwagger = (title, description, props) => {

  let output = {
    type: 'object',
    title: title,
    description: description,
    required: [],
    properties: {}
  }

  props.forEach (object => {

    let keyname = Object.keys(object)[0]
    if (object[keyname].required) {
      output.required.push(keyname)    
      delete object[keyname].required
    }

    output.properties[keyname] = object[keyname]
  })

  return output
}


module.exports = {
  isYupSchema,
  getProps,
  mergeObjects,
  propsToSwagger
}
