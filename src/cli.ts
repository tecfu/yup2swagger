#!/usr/bin/env node
/**
 * CLI for yup-to-swagger
 *
 * Usage:
 *   yup2swagger <schema-module> [options]
 *   yup-to-swagger <schema-module> [options]
 *
 * The schema module must export a Yup schema as `default` or `schema`.
 */
import { parseArgs } from 'node:util'
import { pathToFileURL, fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { parse, type ParseOptions } from './main.js'

const HELP = `
yup-to-swagger — convert a Yup object schema to an OpenAPI 3 Schema Object

Usage:
  yup2swagger <schema-module> [options]
  yup-to-swagger <schema-module> [options]

Arguments:
  <schema-module>   Path to a JS/MJS module that exports a Yup schema
                    (default export or named export \`schema\`)

Options:
  -o, --output <file>     Write result to file (default: stdout)
  -f, --format <fmt>      Output format: yaml | json  (default: yaml)
  -e, --extended          Enable extended string formats (email, uuid, url, …)
  -h, --help              Show this help
  -v, --version           Show version

Examples:
  # Print YAML to stdout
  yup2swagger ./my-schema.js

  # Write JSON to a file
  yup2swagger ./my-schema.js -f json -o schema.json

  # Global install
  npm install -g yup-to-swagger
  yup2swagger ./schemas/user.js -o openapi/user.yaml
`.trim()

function getVersion(): string {
  try {
    const pkgPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      'package.json'
    )
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string }
    return pkg.version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
}

async function loadSchema(modulePath: string): Promise<unknown> {
  const resolved = path.resolve(process.cwd(), modulePath)
  if (!fs.existsSync(resolved)) {
    throw new Error(`Schema module not found: ${resolved}`)
  }
  const url = pathToFileURL(resolved).href
  const mod = (await import(url)) as Record<string, unknown>
  const schema = mod.default ?? mod.schema
  if (!schema || typeof schema !== 'object') {
    throw new Error(
      `Module "${modulePath}" must export a Yup schema as default or named "schema"`
    )
  }
  return schema
}

async function main(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      output: { type: 'string', short: 'o' },
      format: { type: 'string', short: 'f', default: 'yaml' },
      extended: { type: 'boolean', short: 'e', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false }
    },
    allowPositionals: true,
    strict: true
  })

  if (values.help) {
    console.log(HELP)
    process.exit(0)
  }

  if (values.version) {
    console.log(getVersion())
    process.exit(0)
  }

  const schemaModule = positionals[0]
  if (!schemaModule) {
    console.error('Error: missing <schema-module> argument\n')
    console.error(HELP)
    process.exit(1)
  }

  const format = (values.format ?? 'yaml').toLowerCase()
  if (format !== 'yaml' && format !== 'json') {
    console.error(`Error: invalid format "${format}" (use yaml or json)`)
    process.exit(1)
  }

  const schema = await loadSchema(schemaModule)
  const options: ParseOptions = {
    outputFormat: format as 'yaml' | 'json',
    extendedSwaggerFormats: Boolean(values.extended)
  }

  const result = parse(schema, options)
  const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2)

  if (values.output) {
    const outPath = path.resolve(process.cwd(), values.output)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, text.endsWith('\n') ? text : text + '\n', 'utf8')
    console.error(`Wrote ${outPath}`)
  } else {
    process.stdout.write(text.endsWith('\n') ? text : text + '\n')
  }
}

main(process.argv.slice(2)).catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`Error: ${message}`)
  process.exit(1)
})
