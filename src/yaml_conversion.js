const yaml = require('js-yaml')

/**
 * Convert a plain JS object to a YAML string (OpenAPI-friendly).
 * Uses js-yaml v4+ dump API.
 */
const json_to_yaml = (json) => {
  try {
    return yaml.dump(json, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false
    })
  } catch (err) {
    throw new Error(`Failed to convert to YAML: ${err.message}`)
  }
}

module.exports = {
  json_to_yaml
}
