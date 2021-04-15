const parseArgs = require('minimist')
const logUpdate = require('log-update')
const { range } = require('lodash')
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const { loadLootTable, loadItemDetails } = require('./scripts')

const ASSETS = {
  LOOT_TABLE_CSV: './assets/tbc-loot-table.csv',
  LOOT_TABLE_JSON: './assets/tbc-loot-table.json',
  DETAILS_JSON: './assets/tbc-loot-details.json'
}

const saveResults = (path, results) => {
  const resolvedPath = resolve(path)
  writeFileSync(resolvedPath, JSON.stringify(results, null, 2), { encoding: 'utf-8' })
  console.log(`Results saved to ${resolvedPath}.`)
}

const renderProgressBar = (count, total, barLength = 20) => {
  const progress = count / total
  logUpdate(
    `[${range(barLength)
      .map(idx => (idx / barLength < progress ? '=' : ' '))
      .join('')}] ${count}/${total}`
  )
}

async function app() {
  const {
    _: [script],
    input,
    output
  } = parseArgs(process.argv.slice(2), { string: ['input', 'output'] })
  switch (script) {
    case 'loot-to-json': {
      const items = await loadLootTable(resolve(input || ASSETS.LOOT_TABLE_CSV))
      saveResults(output || ASSETS.LOOT_TABLE_JSON, items)
      break
    }
    case 'load-details': {
      const source = readFileSync(resolve(input || ASSETS.LOOT_TABLE_JSON))
      const items = JSON.parse(source)
      for (let i = 0, l = items.length; i < l; ++i) {
        renderProgressBar(i, l)
        const { url } = items[i]
        items[i].item = await loadItemDetails(url)
      }
      saveResults(output || ASSETS.DETAILS_JSON, items)
      break
    }
    default:
      console.log('No script selected.')
  }
}

app().then(
  () => process.exit(0),
  error => console.error(error) || process.exit(1)
)
