/**
 * Basic tests for yup-to-swagger (yup2swagger).
 * Uses Node's built-in test runner (node --test) and official yup.
 */
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const yup = require('yup')
const yup2swag = require('../src/main.js')

describe('yup-to-swagger basic conversion', () => {
  it('converts a simple object schema to JSON OpenAPI Schema Object', () => {
    const schema = yup
      .object()
      .meta({
        title: 'Title of my definition',
        description: 'Description of my definition'
      })
      .shape({
        id: yup.number().integer().positive().required(),
        name: yup.string(),
        email: yup.string().email().required(),
        created: yup.date().nullable(),
        active: yup.boolean().default(true)
      })

    const result = yup2swag.parse(schema, {
      extendedSwaggerFormats: true,
      outputFormat: 'json'
    })

    assert.equal(result.type, 'object')
    assert.equal(result.title, 'Title of my definition')
    assert.equal(result.description, 'Description of my definition')
    assert.ok(Array.isArray(result.required))
    assert.ok(result.required.includes('id'))
    assert.ok(result.required.includes('email'))
    assert.equal(result.properties.id.type, 'integer')
    assert.equal(result.properties.email.type, 'string')
    assert.equal(result.properties.email.format, 'email')
    assert.equal(result.properties.created.nullable, true)
    assert.equal(result.properties.active.type, 'boolean')
    assert.equal(result.properties.active.default, true)
  })

  it('returns YAML string by default', () => {
    const schema = yup.object({
      name: yup.string().required()
    })
    const result = yup2swag.parse(schema)
    assert.equal(typeof result, 'string')
    assert.ok(result.includes('type: object'))
    assert.ok(result.includes('name:'))
  })

  it('handles empty object schema', () => {
    const schema = yup.object({})
    const result = yup2swag.parse(schema, { outputFormat: 'json' })
    assert.equal(result.type, 'object')
    assert.deepEqual(result.properties, {})
  })
})

// Allow running directly with `node test/tests.js` for quick smoke check
if (require.main === module) {
  const schema = yup
    .object()
    .meta({
      title: 'Title of my definition',
      description: 'Description of my definition'
    })
    .shape({
      id: yup.number().integer().positive().required(),
      name: yup.string(),
      email: yup.string().email().required(),
      created: yup.date().nullable(),
      active: yup.boolean().default(true)
    })

  const swaggerDefinition = yup2swag.parse(schema, {
    extendedSwaggerFormats: true,
    outputFormat: 'json'
  })
  console.log(JSON.stringify(swaggerDefinition, null, 2))
}
