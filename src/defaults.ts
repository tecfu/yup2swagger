export interface YupToSwaggerFormatMap {
  [yupType: string]: (string | null)[]
}

export interface YupToSwaggerTypeMap {
  [yupType: string]: string[]
}

export interface YupToSwaggerConditionsMap {
  [yupType: string]: Record<string, string>
}

export interface Defaults {
  customSwaggerTypes: null | Record<string, unknown>
  enforceYupSchema: boolean
  extendedSwaggerFormats: boolean
  extendedYupToSwaggerFormats: YupToSwaggerFormatMap
  outputFormat: 'yaml' | 'json'
  yupConditionKeyToSwaggerFormat: Record<string, string>
  yupSchema: string[]
  yupToSwaggerConditions: YupToSwaggerConditionsMap
  yupToSwaggerFormat: YupToSwaggerFormatMap
  yupToSwaggerType: YupToSwaggerTypeMap
}

export const defaults: Defaults = {
  customSwaggerTypes: null,
  enforceYupSchema: false,
  extendedSwaggerFormats: false,
  extendedYupToSwaggerFormats: {
    string: ['email', 'hostname', 'ipv4', 'ipv6', 'uri', 'url', 'uuid']
  },
  outputFormat: 'yaml',
  yupConditionKeyToSwaggerFormat: {
    $validatePassword: 'password'
  },
  yupSchema: ['fields', 'tests', 'transforms', '_type'],
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
    mixed: ['string']
  }
}
