# yup2swagger

[![Build Status](https://travis-ci.org/tecfu/yup2swagger.svg?branch=master)](https://travis-ci.org/tecfu/yup2swagger) [![NPM version](https://badge.fury.io/js/yup2swagger.svg)](http://badge.fury.io/js/yup2swagger)

---

Convert your Yup schema to a Swagger schema

---

## Please note:

To benefit from the full features of this package, please use the following fork of [Yup]( https://github.com/tecfu/yup ). 

```sh
npm i --save git://github.com/tecfu/yup#build
```
## Example

```js
const yup = require('yup')
const yup2swag = require('yup2swagger')

const schema = yup.object().shape({
  id: yup.number().integer().positive().required(),
  name: yup.string(),
  email: yup.string().email().required(),
  created: yup.date().nullable(),
  active: yup.boolean().default(true)
})

let swagger = yup2swag.convert(schema, {
  extendedFormats: true
})

console.log(swagger)

//{
//  type: 'object',
//  required: [ 'id', 'email' ],
//  properties: {
//    id: { type: 'integer', exclusiveMinimum: 0 },
//    name: { type: 'string' },
//    email: { type: 'string', format: 'email' },
//    created: { type: 'string', format: 'date', nullable: true },
//    active: { type: 'boolean', default: true }
//  }
//}
```

## License

[MIT License](https://opensource.org/licenses/MIT)

Copyright 2019, Tecfu. 

