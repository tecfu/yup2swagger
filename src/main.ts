import { defaults, type Defaults } from './defaults.js'
import {
  isYupSchema,
  getProps,
  mergeObjects,
  propsToSwagger,
  extractFields,
  type OpenApiObjectSchema
} from './schema_conversion.js'
import { jsonToYaml } from './yaml_conversion.js'

export interface ParseOptions {
  /** Enable extra string formats (email, uuid, url, …) */
  extendedSwaggerFormats?: boolean
  /** Extra type → format maps */
  customFormats?: Record<string, (string | null)[]>
  /** Output format */
  outputFormat?: 'yaml' | 'json'
  /** @internal */
  enforceYupSchema?: boolean
  [key: string]: unknown
}

/**
 * Convert a Yup object schema into an OpenAPI 3 Schema Object
 * (or YAML string).
 *
 * Supports both CommonJS `require` and ESM `import`.
 *
 * @example
 * ```ts
 * import yup from 'yup'
 * import { parse } from 'yup-to-swagger'
 *
 * const schema = yup.object({ name: yup.string().required() })
 * const openApi = parse(schema, { outputFormat: 'json' })
 * ```
 */
export function parse(
  schema: unknown,
  options: ParseOptions = {}
): OpenApiObjectSchema | string {
  const formatMap = mergeObjects(
    {},
    defaults.yupToSwaggerFormat,
    options.extendedSwaggerFormats ? defaults.extendedYupToSwaggerFormats : {},
    options.customFormats || {}
  )

  const config: Defaults = Object.assign({}, defaults, options, {
    yupToSwaggerFormat: formatMap
  }) as Defaults

  try {
    isYupSchema(schema, config)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(message)
  }

  const typedSchema = schema as {
    describe?: () => {
      meta?: { title?: string; description?: string }
      fields?: Record<string, unknown>
    }
    meta?: { title?: string; description?: string }
  }

  let title: string | null = null
  let description: string | null = null
  try {
    const sd =
      typeof typedSchema.describe === 'function' ? typedSchema.describe() : null
    if (sd?.meta) {
      title = sd.meta.title || null
      description = sd.meta.description || null
    }
  } catch {
    // ignore
  }

  if (!title && typedSchema.meta?.title) title = typedSchema.meta.title
  if (!description && typedSchema.meta?.description) {
    description = typedSchema.meta.description
  }

  const fieldEntries = extractFields(schema as Parameters<typeof extractFields>[0])
  if (!fieldEntries.length) {
    const empty = propsToSwagger(title, description, [])
    return config.outputFormat === 'json' ? empty : jsonToYaml(empty)
  }

  const props = fieldEntries.map(([name, fieldSchema]) => {
    if (!fieldSchema._type && !fieldSchema.type) {
      if (typeof fieldSchema === 'object') {
        fieldSchema.type = fieldSchema.type || 'mixed'
      } else {
        throw new Error(`Cannot derive type for field "${name}"`)
      }
    }
    return getProps(name, fieldSchema, config)
  })

  const output = propsToSwagger(title, description, props)
  if (config.outputFormat === 'yaml') {
    return jsonToYaml(output)
  }
  return output
}

export default parse

// Re-exports for convenience
export { defaults } from './defaults.js'
export type { OpenApiObjectSchema, OpenApiSchema } from './schema_conversion.js'
