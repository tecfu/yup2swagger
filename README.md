# yup-to-swagger

[![NPM version](https://badge.fury.io/js/yup-to-swagger.svg)](http://badge.fury.io/js/yup-to-swagger)

Convert a [Yup](https://github.com/jquense/yup) object schema into an OpenAPI 3 Schema Object (JSON or YAML).

Written in **TypeScript** with full ESM support (`import` / `export`). Works with official Yup ≥ 0.32 / 1.x.

---

## Install

```bash
npm install yup-to-swagger yup
```

Requires Node.js ≥ 18.

## Usage

### ESM (`import`)

```ts
import * as yup from 'yup'
import { parse } from 'yup-to-swagger'
// or: import parse from 'yup-to-swagger'

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
const yaml = parse(schema, { extendedSwaggerFormats: true })
console.log(yaml)

// JSON
const json = parse(schema, {
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

### CommonJS (`require`)

Because the package is published as ESM, use dynamic import or a bundler:

```js
const { parse } = await import('yup-to-swagger')
```

Or in projects that already use ESM loaders.

## API

### `parse(schema, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `schema` | Yup schema | A Yup object schema (preferably built with `.shape()` / `.object()`) |
| `options` | `ParseOptions` | Optional settings |

**Returns:** OpenAPI Schema Object (`object`) when `outputFormat: 'json'`, otherwise a YAML `string`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputFormat` | `'yaml' \| 'json'` | `'yaml'` | Output format |
| `extendedSwaggerFormats` | `boolean` | `false` | Enable extra string formats (email, uuid, url, …) |
| `customFormats` | `object` | `{}` | Extra type → format maps |

### TypeScript

Types are included:

```ts
import { parse, type ParseOptions, type OpenApiObjectSchema } from 'yup-to-swagger'
```

## Development

```bash
npm install
npm run build    # compiles TypeScript → dist/
npm test         # build + run tests
```

## Limitations

- Best results with top-level object shapes.
- Nested objects / arrays and `when` conditionals have only partial mapping.
- OpenAPI 3.1-style `type: ["string","null"]` is not yet preferred over `nullable: true`.
- Full OpenAPI document generation (paths, components, info) is out of scope; this produces Schema Objects.

## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright 2019–2026, Tecfu and contributors.
