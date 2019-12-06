#!/usr/bin/env node
const yup2swag = require("../src/main.js")
const path = require("path")
const fs = require("fs")
let Yargs = require("yargs")

Yargs.epilog("Copyright github.com/tecfu 2019")

Yargs.option("target",{
  describe: "Specify the file path of the schema(s) you wish to convert"
})

Yargs.option("dest",{
  describe: "Specify the output file path"
})

//run help only at the end
Yargs = Yargs.help("h").argv

let emitError = function(type,detail) {
  console.log(`\n${ type }\n\n${ detail }`)
  process.exit(1)
}

options.terminalAdapter = true
