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

const renderProgressBar = (idx, total, barLength = 20) => {
  const ordinal = idx + 1
  const progress = ordinal / total
  logUpdate(
    `[${range(barLength)
      .map(charIdx => (charIdx / barLength < progress ? '=' : ' '))
      .join('')}] ${ordinal}/${total}`
  )
}

async function lootToJson(input, output) {
  const inputPath = resolve(input || ASSETS.LOOT_TABLE_CSV)
  console.log(`Loading loot table from ${inputPath} and parsing CSV…`)
  try {
    const items = await loadLootTable(inputPath)
    console.log(`${items.length} items parsed.`)
    saveResults(output || ASSETS.LOOT_TABLE_JSON, items)
  } catch (errors) {
    console.error('Failed to load or parse CSV!', errors)
  }
}

async function loadDetails(input, output) {
  const inputPath = resolve(input || ASSETS.LOOT_TABLE_JSON)
  console.log(`Loading loot table from ${inputPath}…`)
  const source = readFileSync()
  const items = JSON.parse(source)
  console.log(`Fetching item details…`)
  for (let i = 0, l = items.length; i < l; ++i) {
    renderProgressBar(i, l)
    const { url } = items[i]
    items[i].item = await loadItemDetails(url)
  }
  saveResults(output || ASSETS.DETAILS_JSON, items)
}

async function app() {
  const {
    _: [script],
    input,
    output
  } = parseArgs(process.argv.slice(2), { string: ['input', 'output'] })
  switch (script) {
    case 'loot-to-json':
      return lootToJson(input, output)
    case 'load-details':
      return loadDetails(input, output)
    default:
      console.log('No script selected.')
  }
}

app().then(
  () => process.exit(0),
  error => console.error(error) || process.exit(1)
)
