const {
  defaults
} = require(`${__dirname}/defaults.js`)

const {
  isYupSchema,
  getProps,
  mergeObjects,
  propsToSwagger
} = require(`${__dirname}/utils.js`)

module.exports.parse = (schema, options) => {
  //handle extended, custom formats
  options.yupToSwaggerFormat = mergeObjects(
    {},
    defaults.yupToSwaggerFormat,
    (options.extendedFormats) ? defaults.extendedYupToSwaggerFormats : {},
    (options.customFormats) ? options.customFormats : {}
  )
  const config = Object.assign({}, defaults, options)

  try {
    isYupSchema(schema, config)
  } catch (err) {
    throw new Error(err)
  }
    
  let props = []
  props = Object.entries(schema.fields).map(field => {
    
    let name = field[0]
    let schema = field[1]
    if(!schema._type || typeof schema._type !== 'string'){
      //Yup type is schema._type
      throw new Error(`Cannot derive field _type in Yup schema, so 
      cannot derive Yup type`)
    }

    return getProps(name, schema, config)
  })
  
  return props
}

module.exports.convert = (schema, options) => {
  let specs = this.parse(schema, options)
  return propsToSwagger(specs)
}
