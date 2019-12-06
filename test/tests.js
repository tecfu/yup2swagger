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

const yup = require('@tecfu/yup')
const yup2swag = require('./../src/main')

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


