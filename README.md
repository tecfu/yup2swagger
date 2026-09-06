# yup-to-swagger

[![NPM version](https://badge.fury.io/js/yup-to-swagger.svg)](http://badge.fury.io/js/yup-to-swagger)
[![CI](https://github.com/tecfu/yup2swagger/actions/workflows/ci.yml/badge.svg)](https://github.com/tecfu/yup2swagger/actions/workflows/ci.yml)

Convert a [Yup](https://github.com/jquense/yup) object schema into an OpenAPI 3 Schema Object (JSON or YAML).

Written in **TypeScript** with full ESM support (`import` / `export`). Works with official Yup ≥ 0.32 / 1.x.

---

## Install

### Library (project dependency)

```bash
npm install yup-to-swagger yup
```

### CLI (global)

Install the CLI globally from the npm registry:

```bash
npm install -g yup-to-swagger
```

This provides the `yup2swagger` and `yup-to-swagger` commands on your `PATH`.

Requires Node.js ≥ 18.

You can also run it without a global install:

```bash
npx yup-to-swagger ./my-schema.js
```

---

## CLI usage

Point the CLI at a JS module that **default-exports** (or named-exports `schema`) a Yup object schema:

```bash
# YAML to stdout (default)
yup2swagger ./schemas/user.js

# JSON to a file
yup2swagger ./schemas/user.js --format json --output openapi/user.json

# Short flags + extended formats (email, uuid, url, …)
yup2swagger ./schemas/user.js -f yaml -o user.yaml -e
```

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Write result to file (default: stdout) |
| `-f, --format <fmt>` | `yaml` or `json` (default: `yaml`) |
| `-e, --extended` | Enable extended string formats |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

Example schema module (`schemas/user.js`):

```js
import * as yup from 'yup'

export default yup
  .object()
  .meta({ title: 'User', description: 'A user record' })
  .shape({
    id: yup.number().integer().positive().required(),
    email: yup.string().email().required(),
    name: yup.string()
  })
```

---

## Library usage

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

### CommonJS

Because the package is published as ESM, use dynamic import:

```js
const { parse } = await import('yup-to-swagger')
```

## API

### `parse(schema, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `schema` | Yup schema | A Yup object schema (`.object()` / `.shape()`) |
| `options` | `ParseOptions` | Optional settings |

**Returns:** OpenAPI Schema Object when `outputFormat: 'json'`, otherwise a YAML `string`.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputFormat` | `'yaml' \| 'json'` | `'yaml'` | Output format |
| `extendedSwaggerFormats` | `boolean` | `false` | Extra string formats (email, uuid, url, …) |
| `customFormats` | `object` | `{}` | Extra type → format maps |

### TypeScript

```ts
import { parse, type ParseOptions, type OpenApiObjectSchema } from 'yup-to-swagger'
```

## Development

```bash
npm install
npm run build    # compiles TypeScript → dist/
npm test         # build + run tests
npm run cli -- ./path/to/schema.js
```

## Limitations

- Best results with top-level object shapes.
- Nested objects / arrays and `when` conditionals have only partial mapping.
- OpenAPI 3.1-style `type: ["string","null"]` is not yet preferred over `nullable: true`.
- Full OpenAPI document generation (paths, components, info) is out of scope; this produces Schema Objects.

## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright 2019–2026, Tecfu and contributors.
