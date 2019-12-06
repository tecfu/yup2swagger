const yaml = require('js-yaml')
const fs = require('fs')

const json_to_yaml = (json) => {
  let yamlStr

  try {
    yamlStr = yaml.safeDump(json)
  }
  catch (err) {
    throw new Error (err)
  }

  return yamlStr
}

const yaml_to_file = (yaml, directory) => {
  try {
    fs.writeFileSync(`${directory}/swagger.yaml`, yaml, 'utf8')
  }
  catch (err) {
    throw new Error (err)
  }
}

module.exports = {
  json_to_yaml,
  yaml_to_file
}
