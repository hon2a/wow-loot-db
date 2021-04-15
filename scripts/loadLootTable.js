const Papaparse = require('papaparse')
const { camelCase } = require('lodash')
const { createReadStream } = require('fs')

function loadLootTable(path) {
  return new Promise((resolve, reject) =>
    Papaparse.parse(createReadStream(path), {
      header: true,
      transformHeader: camelCase,
      complete: ({ data, errors }) => (errors.length ? reject(errors) : resolve(data))
    })
  )
}

module.exports = { loadLootTable }
