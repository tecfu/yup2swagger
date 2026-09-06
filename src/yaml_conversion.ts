import yaml from 'js-yaml'

/**
 * Convert a plain JS object to a YAML string (OpenAPI-friendly).
 * Uses js-yaml v4+ dump API.
 */
export function jsonToYaml(json: unknown): string {
  try {
    return yaml.dump(json, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to convert to YAML: ${message}`)
  }
}

/** @deprecated Use jsonToYaml */
export const json_to_yaml = jsonToYaml
