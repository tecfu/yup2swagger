# yup-to-swagger

[![NPM version](https://badge.fury.io/js/yup-to-swagger.svg)](http://badge.fury.io/js/yup-to-swagger)

Convert a [Yup](https://github.com/jquense/yup) object schema into an OpenAPI 3 Schema Object (JSON or YAML).

> **0.1.0 modernization notes**
> - Works with official Yup (0.32+ / 1.x). The old `@tecfu/yup` fork is no longer required.
> - Fixed required-field detection.
> - Updated to `js-yaml` v4.
> - Prefer public `schema.describe()` when available.
> - Basic Node test runner coverage added.
> - Still focused on object schemas; nested objects/arrays and advanced conditionals have limited support.

---

## Install

```bash
npm install yup-to-swagger yup
```

## Example

```js
const yup = require('yup')
const yup2swag = require('yup-to-swagger')

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

// YAML (default)
const yaml = yup2swag.parse(schema, { extendedSwaggerFormats: true })
console.log(yaml)

// JSON
const json = yup2swag.parse(schema, {
  extendedSwaggerFormats: true,
  outputFormat: 'json'
})
console.log(json)
/*
{
  type: 'object',
  title: 'Title of my definition',
  description: 'Description of my definition',
  required: [ 'id', 'email' ],
  properties: {
    id: { type: 'integer', minimum: 0 },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    created: { type: 'string', format: 'date', nullable: true },
    active: { type: 'boolean', default: true }
  }
}
*/
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputFormat` | `'yaml' \| 'json'` | `'yaml'` | Output format |
| `extendedSwaggerFormats` | `boolean` | `false` | Enable extra string formats (email, uuid, url, …) |
| `customFormats` | `object` | `{}` | Extra type → format maps |

## Limitations (current)

- Best results with top-level object shapes.
- Nested objects / arrays and `when` conditionals have only partial mapping.
- OpenAPI 3.1-style `type: ["string","null"]` is not yet preferred over `nullable: true`.
- Full OpenAPI document generation (paths, components, info) is out of scope; this produces Schema Objects.

## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright 2019–2026, Tecfu and contributors.
