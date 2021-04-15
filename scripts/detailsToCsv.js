const { get, zipObject, isFunction } = require('lodash')
const Papa = require('papaparse')

const pickFields = (items, fields) =>
  items.map(item =>
    zipObject(
      Object.keys(fields),
      Object.values(fields).map(getterOrPath => {
        if (isFunction(getterOrPath)) return getterOrPath(item)
        if (getterOrPath) return get(item, getterOrPath)
        return undefined
      })
    )
  )

async function detailsToCsv(items, fields) {
  const data = pickFields(items, fields)
  return Papa.unparse(data, { columns: Object.keys(fields) })
}

module.exports = { detailsToCsv }
