const isArray = (item) => {
  return item && typeof item === 'object' && Array.isArray(item)
}

const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Basic check that input looks like a Yup schema.
 * Relaxed for official Yup 1.x (internals differ from the old fork).
 */
const isYupSchema = (input, config) => {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Input schema must be an object')
  }

  // Prefer public describe() when available (Yup >=0.32 / 1.x)
  if (typeof input.describe === 'function') {
    return true
  }

  if (config.enforceYupSchema) {
    const requiredProps = config.yupSchema || []
    requiredProps.forEach((prop) => {
      if (!Object.prototype.hasOwnProperty.call(input, prop)) {
        throw new Error(`Yup schemas should have '${prop}' property defined`)
      }
    })
  }

  return true
}

const mergeObjects = (target, ...sources) => {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) target[key] = {}
        mergeObjects(target[key], source[key])
      } else if (isArray(source[key]) && isArray(target[key])) {
        target[key] = target[key].concat(source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return mergeObjects(target, ...sources)
}

/**
 * Search Yup tests (works with both old _tests / tests and describe() style).
 */
const searchTests = (yupField, searchArr) => {
  const tests = yupField.tests || yupField._tests || []
  return searchArr
    .map((searchTerm) => {
      const matchingTest = tests.find((test) => {
        const name = (test.OPTIONS && test.OPTIONS.name) || test.name || test
        return searchTerm === name
      })
      if (matchingTest) {
        let value = true
        if (matchingTest.OPTIONS && matchingTest.OPTIONS.params) {
          const entries = Object.entries(matchingTest.OPTIONS.params)
          if (entries.length) value = entries[0][1]
        } else if (matchingTest.params) {
          const entries = Object.entries(matchingTest.params)
          if (entries.length) value = entries[0][1]
        }
        return [searchTerm, value]
      }
      return undefined
    })
    .filter((x) => typeof x !== 'undefined')
}

const getType = (yupField, config) => {
  const typeKey = yupField._type || (yupField.type) || 'mixed'
  const searchArr = config.yupToSwaggerType[typeKey]
  if (!searchArr) {
    // Fallback rather than hard throw for unknown types
    return { type: 'string', yupType: typeKey }
  }

  const testResults = searchTests(yupField, searchArr)
  const result = testResults.length ? testResults[0][0] : null
  return { type: result || searchArr[0], yupType: typeKey }
}

const getFormat = (yupField, config) => {
  const typeKey = yupField._type || yupField.type || 'string'
  const formats = config.yupToSwaggerFormat[typeKey] || []
  const testResults = searchTests(yupField, formats)

  if (testResults.length) {
    return testResults[0][0]
  }

  // Fallback: common format tests that live under string
  if (typeKey === 'string') {
    const common = ['email', 'url', 'uuid', 'hostname']
    const found = searchTests(yupField, common)
    if (found.length) return found[0][0]
  }

  return formats[0] || null
}

const getMiscAttributes = (yupField, config, yupType) => {
  const conditions = config.yupToSwaggerConditions[yupType] || {}
  const searchArr = Object.keys(conditions)
  const testResults = searchTests(yupField, searchArr).map((arr) => {
    return [conditions[arr[0]], arr[1]]
  })
  return testResults
}

const getNullable = (yupField) => {
  if (typeof yupField._nullable !== 'undefined') return !!yupField._nullable
  if (typeof yupField.spec !== 'undefined' && typeof yupField.spec.nullable !== 'undefined') {
    return !!yupField.spec.nullable
  }
  // From describe()
  if (yupField.nullable === true) return true
  return null
}

const getDefault = (yupField) => {
  if (typeof yupField._default !== 'undefined' && yupField._default !== undefined) {
    return typeof yupField._default === 'function' ? yupField._default() : yupField._default
  }
  if (yupField.spec && yupField.spec.default !== undefined) {
    const d = yupField.spec.default
    return typeof d === 'function' ? d() : d
  }
  if (yupField.default !== undefined) {
    return typeof yupField.default === 'function' ? yupField.default() : yupField.default
  }
  return null
}

/**
 * Detect whether a field is required.
 * Works with classic tests and with schema.describe() output.
 */
const isRequiredField = (yupField) => {
  // Modern Yup describe() marks required fields with optional: false
  if (yupField.optional === false) return true
  if (yupField.optional === true) return false
  // Classic path
  const tests = yupField.tests || yupField._tests || []
  const hasRequiredTest = tests.some((t) => {
    const name = (t.OPTIONS && t.OPTIONS.name) || t.name
    return name === 'required'
  })
  if (hasRequiredTest) return true

  // describe() path – presence of 'required' in tests or exclusiveTests
  if (Array.isArray(yupField.tests)) {
    if (yupField.tests.some((t) => t.name === 'required' || (t.OPTIONS && t.OPTIONS.name === 'required'))) {
      return true
    }
  }
  if (yupField.exclusiveTests && yupField.exclusiveTests.required) return true

  // Fallback for old fork
  if (yupField._exclusive && yupField._exclusive.required) return true

  return false
}

const getProps = (name, schema, config) => {
  const result = {}
  const { type, yupType } = getType(schema, config)
  let format = getFormat(schema, config)
  const miscAttrs = getMiscAttributes(schema, config, yupType)
  const nullable = getNullable(schema)
  const _default = getDefault(schema)
  const required = isRequiredField(schema)

  result.type = type
  if (format) result.format = format
  if (nullable) result.nullable = true
  if (_default !== null && _default !== undefined) {
    result.default = _default
  }
  if (miscAttrs.length) {
    miscAttrs.forEach((arr) => {
      // Skip the synthetic "required" key – handled at object level
      if (arr[0] !== 'required') {
        result[arr[0]] = arr[1]
      }
    })
  }

  // Attach required flag so propsToSwagger can collect it
  if (required) {
    result.required = true
  }

  return { [name]: result }
}

/**
 * Build the final OpenAPI Schema Object (type: object).
 */
const propsToSwagger = (title, description, props) => {
  const output = {
    type: 'object',
    properties: {}
  }

  if (title) output.title = title
  if (description) output.description = description

  const required = []

  props.forEach((object) => {
    const keyname = Object.keys(object)[0]
    const prop = object[keyname]
    if (prop.required) {
      required.push(keyname)
      delete prop.required
    }
    output.properties[keyname] = prop
  })

  if (required.length) {
    output.required = required
  }

  return output
}

/**
 * Prefer schema.describe() when available (modern Yup).
 * Falls back to walking .fields for older / forked schemas.
 */
const extractFields = (schema) => {
  if (typeof schema.describe === 'function') {
    try {
      const desc = schema.describe()
      if (desc && desc.fields && typeof desc.fields === 'object') {
        return Object.entries(desc.fields).map(([name, fieldDesc]) => {
          // Re-attach a minimal schema-like object for getProps
          // fieldDesc already has type, tests, nullable, etc.
          return [name, fieldDesc]
        })
      }
    } catch (e) {
      // fall through
    }
  }

  // Classic path (old fork or direct fields)
  if (schema.fields && typeof schema.fields === 'object') {
    return Object.entries(schema.fields)
  }

  return []
}

module.exports = {
  isYupSchema,
  getProps,
  mergeObjects,
  propsToSwagger,
  extractFields,
  isRequiredField
}
