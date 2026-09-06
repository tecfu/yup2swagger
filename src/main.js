const { defaults } = require(`${__dirname}/defaults.js`)

const {
  isYupSchema,
  getProps,
  mergeObjects,
  propsToSwagger,
  extractFields
} = require(`${__dirname}/schema_conversion.js`)

const { json_to_yaml } = require(`${__dirname}/yaml_conversion.js`)

/**
 * Convert a Yup object schema into an OpenAPI 3 Schema Object
 * (or YAML string).
 *
 * @param {object} schema - A Yup schema (object shape preferred)
 * @param {object} [options]
 * @param {boolean} [options.extendedSwaggerFormats=false]
 * @param {object}  [options.customFormats]
 * @param {'yaml'|'json'} [options.outputFormat='yaml']
 * @returns {object|string}
 */
module.exports.parse = (schema, options = {}) => {
  // Merge format maps
  const formatMap = mergeObjects(
    {},
    defaults.yupToSwaggerFormat,
    options.extendedSwaggerFormats ? defaults.extendedYupToSwaggerFormats : {},
    options.customFormats || {}
  )

  const config = Object.assign({}, defaults, options, {
    yupToSwaggerFormat: formatMap
  })

  try {
    isYupSchema(schema, config)
  } catch (err) {
    throw new Error(err.message || err)
  }

  // Prefer public describe() for title / description (modern Yup)
  let title = null
  let description = null
  try {
    const sd = typeof schema.describe === 'function' ? schema.describe() : null
    if (sd && sd.meta) {
      title = sd.meta.title || null
      description = sd.meta.description || null
    }
  } catch (e) {
    // ignore
  }

  // Fallback for older meta placement
  if (!title && schema.meta && schema.meta.title) title = schema.meta.title
  if (!description && schema.meta && schema.meta.description) {
    description = schema.meta.description
  }

  const fieldEntries = extractFields(schema)
  if (!fieldEntries.length) {
    // Empty object schema is still valid
    const empty = propsToSwagger(title, description, [])
    return config.outputFormat === 'json' ? empty : json_to_yaml(empty)
  }

  const props = fieldEntries.map(([name, fieldSchema]) => {
    // Guard against missing type info
    if (!fieldSchema._type && !fieldSchema.type) {
      // describe() objects use .type
      if (typeof fieldSchema === 'object') {
        fieldSchema.type = fieldSchema.type || 'mixed'
      } else {
        throw new Error(`Cannot derive type for field "${name}"`)
      }
    }
    return getProps(name, fieldSchema, config)
  })

  let output = propsToSwagger(title, description, props)
  if (config.outputFormat === 'yaml') {
    output = json_to_yaml(output)
  }
  return output
}

// Named export convenience
module.exports.default = module.exports.parse
