const defaults = {
  customSwaggerTypes: null,
  enforceYupSchema: false, // relaxed for official Yup 1.x (private fields differ)
  extendedSwaggerFormats: false,
  extendedYupToSwaggerFormats: {
    string: [
      'email',
      'hostname',
      'ipv4',
      'ipv6',
      'uri',
      'url',
      'uuid'
    ]
  },
  outputFormat: 'yaml', // 'yaml' | 'json'
  yupConditionKeyToSwaggerFormat: {
    $validatePassword: 'password'
  },
  // Kept for backward-compat checks; not strictly enforced on modern Yup
  yupSchema: [
    'fields',
    'tests',
    'transforms',
    '_type'
  ],
  yupToSwaggerConditions: {
    boolean: {
      required: 'required',
      default: 'default'
    },
    number: {
      required: 'required',
      lessThan: 'exclusiveMaximum',
      moreThan: 'exclusiveMinimum',
      min: 'minimum',
      max: 'maximum',
      multipleOf: 'multipleOf',
      negative: 'exclusiveMaximum',
      positive: 'exclusiveMinimum'
    },
    string: {
      required: 'required',
      min: 'minLength',
      max: 'maxLength',
      matches: 'pattern'
    },
    array: {
      min: 'minItems',
      max: 'maxItems'
    }
  },
  yupToSwaggerFormat: {
    array: [null],
    boolean: [null],
    date: ['date', 'date-time'],
    number: [null, 'int32', 'int64', 'float', 'double'],
    string: [null, 'byte', 'binary', 'password']
  },
  yupToSwaggerType: {
    array: ['array'],
    boolean: ['boolean'],
    number: ['number', 'integer'],
    string: ['string'],
    date: ['string'],
    object: ['object'],
    mixed: ['string'] // fallback
  }
}

module.exports = {
  defaults
}
