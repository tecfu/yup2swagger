const defaults = {
  "customSwaggerTypes": null,
  "enforceYupSchema": true,
  "extendedSwaggerFormats": false,
  "extendedYupToSwaggerFormats": {
    "string": [
      "email",
      "hostname",
      "image",
      "ipv4",
      "ipv6",
      "phone-number",
      "uri",
      "url",
      "uuid",
      "video"
    ]
  },
  "outputFormat": "yaml",
  "swagger": { 
    "base": {
      "swagger": "3.0",
      "info": {
        "description": null,
        "version": null,
        "title": null,
        "license": {
          "name": null,
          "url": null
        }
      },
      "host": null,
      "basePath": null,
      "tags": [],
      "schemes": ["http"],
      "paths": {},
      "definitions": {},
      "securityDefinitions": {}
    },
    "path": {
      "tags": [],
      "summary": null,
      "description": null,
      "operationId": null,
      "consumes": ["application/json"],
      "produces": ["application/json"],
      "parameters": []
    }
  },
  "yupConditionKeyToSwaggerFormat": {
    "$validatePassword": "password"
  },
  "yupSchema": [
    "fields",
    "tests",
    "transforms",
    "_blacklist",
    "_conditions",
    "_defaultDefault",
    "_deps",
    "_excludedEdges",
    "_exclusive",
    "_mutate",
    "_nodes",
    "_options",
    "_type",
    "_typeError",
    "_whitelist"
  ],
  "yupToSwaggerConditions": {
    //"array": [
    //  "items",
    //  "minItems",
    //  "maxItems",
    //  "uniqueItems"
    //],
    "boolean": {
      "required": "required",
      "default": "default"
    },
    "number": { 
      "required": "required",
      "lessThan": "exclusiveMaximum",
      "moreThan": "exclusiveMinimum",
      "min": "minimum",
      "max": "maximum",
      "multipleOf": "multipleOf",
      "negative": "exclusiveMaximum",
      "positive": "exclusiveMinimum"
      //"nullable"
    },
    "string": { 
      "required": "required",
      "min": "minLength",
      "max": "maxLength",
      //"nullable",
      "matches": "pattern"
    }
  },
  "yupToSwaggerFormat": {
    "array": [
      null
    ],
    "boolean": [
     null,
    ],
    "date": [
     "date",
     "date-time",
    ],
    "number": [
      null,
     "int32",
     "int64",
     "float",
     "double"
    ],
    "string": [
      null,
      "byte",
      "binary",
      "password"
    ]
  },
  "yupToSwaggerType": { 
    //"BooleanSchema": ["boolean"],
    //"NumberSchema": ["integer", "number"],
    //"StringSchema": ["string"]
    "array": ["array"],
    "boolean": ["boolean"],
    "number": ["number", "integer"],
    "string": ["string"],
    "date": ["string"]
  }
}

module.exports = {
  defaults
}
