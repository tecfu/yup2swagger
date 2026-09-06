import type { Defaults } from './defaults.js'

export type OpenApiSchema = {
  type?: string
  format?: string | null
  nullable?: boolean
  default?: unknown
  required?: boolean
  [key: string]: unknown
}

export type OpenApiObjectSchema = {
  type: 'object'
  title?: string | null
  description?: string | null
  required?: string[]
  properties: Record<string, OpenApiSchema>
}

type YupLikeField = {
  _type?: string
  type?: string
  tests?: Array<{ name?: string; OPTIONS?: { name?: string; params?: Record<string, unknown> }; params?: Record<string, unknown> }>
  _tests?: Array<{ name?: string; OPTIONS?: { name?: string; params?: Record<string, unknown> }; params?: Record<string, unknown> }>
  _nullable?: boolean
  nullable?: boolean
  optional?: boolean
  _default?: unknown
  default?: unknown
  spec?: { nullable?: boolean; default?: unknown }
  exclusiveTests?: Record<string, boolean>
  _exclusive?: Record<string, boolean>
  fields?: Record<string, YupLikeField>
  meta?: { title?: string; description?: string }
  describe?: () => {
    meta?: { title?: string; description?: string }
    fields?: Record<string, YupLikeField>
  }
  [key: string]: unknown
}

const isArray = (item: unknown): item is unknown[] =>
  Boolean(item && typeof item === 'object' && Array.isArray(item))

const isObject = (item: unknown): item is Record<string, unknown> =>
  Boolean(item && typeof item === 'object' && !Array.isArray(item))

/**
 * Basic check that input looks like a Yup schema.
 * Relaxed for official Yup 1.x (private fields differ).
 */
export function isYupSchema(input: unknown, config: Defaults): boolean {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Input schema must be an object')
  }

  const schema = input as YupLikeField
  if (typeof schema.describe === 'function') {
    return true
  }

  if (config.enforceYupSchema) {
    const requiredProps = config.yupSchema || []
    for (const prop of requiredProps) {
      if (!Object.prototype.hasOwnProperty.call(input, prop)) {
        throw new Error(`Yup schemas should have '${prop}' property defined`)
      }
    }
  }

  return true
}

export function mergeObjects<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Record<string, unknown> | undefined>
): T {
  if (!sources.length) return target
  const source = sources.shift()
  if (!source) return mergeObjects(target, ...sources)

  if (isObject(target) && isObject(source)) {
    for (const key of Object.keys(source)) {
      const sourceVal = source[key]
      if (isObject(sourceVal)) {
        if (!(target as Record<string, unknown>)[key]) {
          ;(target as Record<string, unknown>)[key] = {}
        }
        mergeObjects(
          (target as Record<string, unknown>)[key] as Record<string, unknown>,
          sourceVal
        )
      } else if (
        isArray(sourceVal) &&
        isArray((target as Record<string, unknown>)[key])
      ) {
        ;(target as Record<string, unknown>)[key] = (
          (target as Record<string, unknown>)[key] as unknown[]
        ).concat(sourceVal)
      } else {
        Object.assign(target, { [key]: sourceVal })
      }
    }
  }

  return mergeObjects(target, ...sources)
}

function searchTests(
  yupField: YupLikeField,
  searchArr: (string | null)[]
): Array<[string, unknown]> {
  const tests = yupField.tests || yupField._tests || []
  return searchArr
    .filter((term): term is string => term !== null)
    .map((searchTerm) => {
      const matchingTest = tests.find((test) => {
        const name =
          (test.OPTIONS && test.OPTIONS.name) || test.name || (test as unknown)
        return searchTerm === name
      })
      if (matchingTest) {
        let value: unknown = true
        if (matchingTest.OPTIONS?.params) {
          const entries = Object.entries(matchingTest.OPTIONS.params)
          if (entries.length) value = entries[0][1]
        } else {
          const params = (matchingTest as { params?: Record<string, unknown> }).params
          if (params) {
            const entries = Object.entries(params)
            if (entries.length) value = entries[0][1]
          }
        }
        return [searchTerm, value] as [string, unknown]
      }
      return undefined
    })
    .filter((x): x is [string, unknown] => typeof x !== 'undefined')
}

function getType(
  yupField: YupLikeField,
  config: Defaults
): { type: string; yupType: string } {
  const typeKey = yupField._type || yupField.type || 'mixed'
  const searchArr = config.yupToSwaggerType[typeKey]
  if (!searchArr) {
    return { type: 'string', yupType: typeKey }
  }

  const testResults = searchTests(yupField, searchArr)
  const result = testResults.length ? testResults[0][0] : null
  return { type: result || searchArr[0], yupType: typeKey }
}

function getFormat(yupField: YupLikeField, config: Defaults): string | null {
  const typeKey = yupField._type || yupField.type || 'string'
  const formats = config.yupToSwaggerFormat[typeKey] || []
  const testResults = searchTests(yupField, formats)

  if (testResults.length) {
    return testResults[0][0]
  }

  if (typeKey === 'string') {
    const common = ['email', 'url', 'uuid', 'hostname']
    const found = searchTests(yupField, common)
    if (found.length) return found[0][0]
  }

  return (formats[0] as string | null) || null
}

function getMiscAttributes(
  yupField: YupLikeField,
  config: Defaults,
  yupType: string
): Array<[string, unknown]> {
  const conditions = config.yupToSwaggerConditions[yupType] || {}
  const searchArr = Object.keys(conditions)
  return searchTests(yupField, searchArr).map((arr) => {
    return [conditions[arr[0]], arr[1]]
  })
}

function getNullable(yupField: YupLikeField): boolean | null {
  if (typeof yupField._nullable !== 'undefined') return Boolean(yupField._nullable)
  if (yupField.spec && typeof yupField.spec.nullable !== 'undefined') {
    return Boolean(yupField.spec.nullable)
  }
  if (yupField.nullable === true) return true
  return null
}

function getDefault(yupField: YupLikeField): unknown {
  if (typeof yupField._default !== 'undefined' && yupField._default !== undefined) {
    return typeof yupField._default === 'function'
      ? (yupField._default as () => unknown)()
      : yupField._default
  }
  if (yupField.spec && yupField.spec.default !== undefined) {
    const d = yupField.spec.default
    return typeof d === 'function' ? (d as () => unknown)() : d
  }
  if (yupField.default !== undefined) {
    return typeof yupField.default === 'function'
      ? (yupField.default as () => unknown)()
      : yupField.default
  }
  return null
}

/**
 * Detect whether a field is required.
 * Works with classic tests and with schema.describe() output.
 */
export function isRequiredField(yupField: YupLikeField): boolean {
  if (yupField.optional === false) return true
  if (yupField.optional === true) return false

  const tests = yupField.tests || yupField._tests || []
  const hasRequiredTest = tests.some((t) => {
    const name = (t.OPTIONS && t.OPTIONS.name) || t.name
    return name === 'required'
  })
  if (hasRequiredTest) return true

  if (Array.isArray(yupField.tests)) {
    if (
      yupField.tests.some(
        (t) => t.name === 'required' || (t.OPTIONS && t.OPTIONS.name === 'required')
      )
    ) {
      return true
    }
  }
  if (yupField.exclusiveTests && yupField.exclusiveTests.required) return true
  if (yupField._exclusive && yupField._exclusive.required) return true

  return false
}

export function getProps(
  name: string,
  schema: YupLikeField,
  config: Defaults
): Record<string, OpenApiSchema> {
  const result: OpenApiSchema = {}
  const { type, yupType } = getType(schema, config)
  const format = getFormat(schema, config)
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
  for (const arr of miscAttrs) {
    if (arr[0] !== 'required') {
      result[arr[0]] = arr[1]
    }
  }

  if (required) {
    result.required = true
  }

  return { [name]: result }
}

/**
 * Build the final OpenAPI Schema Object (type: object).
 */
export function propsToSwagger(
  title: string | null,
  description: string | null,
  props: Array<Record<string, OpenApiSchema>>
): OpenApiObjectSchema {
  const output: OpenApiObjectSchema = {
    type: 'object',
    properties: {}
  }

  if (title) output.title = title
  if (description) output.description = description

  const required: string[] = []

  for (const object of props) {
    const keyname = Object.keys(object)[0]
    const prop = object[keyname]
    if (prop.required) {
      required.push(keyname)
      delete prop.required
    }
    output.properties[keyname] = prop
  }

  if (required.length) {
    output.required = required
  }

  return output
}

/**
 * Prefer schema.describe() when available (modern Yup).
 * Falls back to walking .fields for older / forked schemas.
 */
export function extractFields(
  schema: YupLikeField
): Array<[string, YupLikeField]> {
  if (typeof schema.describe === 'function') {
    try {
      const desc = schema.describe()
      if (desc && desc.fields && typeof desc.fields === 'object') {
        return Object.entries(desc.fields).map(([name, fieldDesc]) => [
          name,
          fieldDesc as YupLikeField
        ])
      }
    } catch {
      // fall through
    }
  }

  if (schema.fields && typeof schema.fields === 'object') {
    return Object.entries(schema.fields)
  }

  return []
}
