const Papaparse = require('papaparse')
const { camelCase } = require('lodash')
const { createReadStream } = require('fs')

function loadLootTable(path) {
  console.log(`Parsing ${path}…`)
  return new Promise((resolve, reject) =>
    Papaparse.parse(createReadStream(path), {
      header: true,
      transformHeader: camelCase,
      complete: ({ data, errors }) => {
        const hasErrors = Boolean(errors.length)
        console.log(hasErrors ? 'Failed to parse:' : `${data.length} entries parsed.`, ...errors)
        return hasErrors ? reject(errors) : resolve(data)
      }
    })
  )
}

module.exports = { loadLootTable }
