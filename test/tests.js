//const joi = require('joi')
//var j2s = require('joi-to-swagger');
//
//const schema = joi.object().keys({
//  id:      joi.number().integer().positive().required(),
//  name:    joi.string(),
//  email:   joi.string().email().required(),
//  created: joi.date().allow(null),
//  active:  joi.boolean().default(true),
//})
//
////var {swagger, components} = j2s(mySchema, existingComponents);
//var {swagger} = j2s(schema);
//
//console.log(swagger)

const yup = require('yup')
const yup2swag = require('./../src/main')

const schema = yup.object().shape({
  id: yup.number().integer().positive().required(),
  name: yup.string(),
  email: yup.string().email().required(),
  created: yup.date().nullable(),
  active: yup.boolean().default(true)
})

//let props = yup2swag.parse(schema, {
//  extendedFormats: true
//})
//console.log(props)

let swagger = yup2swag.convert(schema, {
  extendedFormats: true
})
console.log(swagger)


