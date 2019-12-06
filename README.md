# yup2swagger

[![Build Status](https://travis-ci.org/tecfu/yup2swagger.svg?branch=master)](https://travis-ci.org/tecfu/yup2swagger) [![NPM version](https://badge.fury.io/js/yup2swagger.svg)](http://badge.fury.io/js/yup2swagger)

---

Convert Yup to Swagger. Transforms a Yup schema into a Swagger/OpenAPI yaml definition.

---

## Example

```js
const yup = require('yup')
const yup2swag = require('yup2swagger')

const schema = yup
  .object()
  .meta({ 
    title: "Title of my definition",
    description: "Description of my definition"
  })
  .shape({
    id: yup.number().integer().positive().required(),
    name: yup.string(),
    email: yup.string().email().required(),
    created: yup.date().nullable(),
    active: yup.boolean().default(true)
  })

let swaggerDefinition = yup2swag.parse(schema, {
  extendedSwaggerFormats: true
})
console.log(swaggerDefinition)

// type: object
// title: Title of my definition
// description: Description of my definition
// required:
//   - id
//   - email
// properties:
//   id:
//     type: integer
//     minimum: 0
//   name:
//     type: string
//   email:
//     type: string
//     format: email
//   created:
//     type: string
//     format: date
//     nullable: true
//   active:
//     type: boolean
//     default: true

```

Or if you want JSON output:

```js

let swaggerDefinition = yup2swag.parse(schema, {
  extendedSwaggerFormats: true,
  outputFormat: "json"
})
console.log(swaggerDefinition)

// {
//   type: 'object',
//   title: 'Title of my definition',
//   description: 'Description of my definition',
//   required: [ 'id', 'email' ],
//   properties: {
//     id: { type: 'integer', minimum: 0 },
//     name: { type: 'string' },
//     email: { type: 'string', format: 'email' },
//     created: { type: 'string', format: 'date', nullable: true },
//     active: { type: 'boolean', default: true }
//   }
// }

```

## Please note:

To benefit from the full features of this package, please use the following fork of [Yup]( https://github.com/tecfu/yup ). 

```sh
npm i --save git://github.com/tecfu/yup#build
```

## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright 2019, Tecfu. 
