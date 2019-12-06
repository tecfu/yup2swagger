const {
  defaults
} = require(`${__dirname}/defaults.js`)

const {
  isYupSchema,
  getProps,
  mergeObjects,
  propsToSwagger
} = require(`${__dirname}/schema_conversion.js`)

const {
  json_to_yaml 
} = require(`${__dirname}/yaml_conversion.js`)

module.exports.parse = (schema, options) => {
  
  //handle extended, custom formats
  options.yupToSwaggerFormat = mergeObjects(
    {},
    defaults.yupToSwaggerFormat,
    (options.extendedSwaggerFormats) ? defaults.extendedYupToSwaggerFormats : {},
    (options.customFormats) ? options.customFormats : {}
  )
  const config = Object.assign({}, defaults, options)

  try {
    isYupSchema(schema, config)
  } catch (err) {
    throw new Error(err)
  }
    
  //get swagger title from yup schema
  const sd = schema.describe()
  let title = (sd.meta && sd.meta.title) ? sd.meta.title : null

  //get swagger description from yup schema
  let description = (sd.meta && sd.meta.description) ? sd.meta.description : null
  
  //get swagger properties from yup schema fields
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
  
  let output = propsToSwagger(title, description, props)
  if(config.outputFormat === 'yaml') output = json_to_yaml(output)
  return output
}
