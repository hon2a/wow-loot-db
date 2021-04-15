const parseArgs = require('minimist')
const logUpdate = require('log-update')
const { range } = require('lodash')
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const { loadLootTable, loadItemDetails, detailsToCsv } = require('./scripts')

const ASSETS = {
  LOOT_TABLE_CSV: './assets/tbc-loot-table.csv',
  LOOT_TABLE_JSON: './assets/tbc-loot-table.json',
  DETAILS_JSON: './assets/tbc-loot-details.json',
  EXPORT_CSV: './export/tbc-loot-details.csv'
}

const saveResults = (path, content) => {
  const resolvedPath = resolve(path)
  writeFileSync(resolvedPath, content, { encoding: 'utf-8' })
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

const stringify = object => JSON.stringify(object, null, 2)

async function lootToJson(input, output) {
  const inputPath = resolve(input || ASSETS.LOOT_TABLE_CSV)
  console.log(`Loading loot table from ${inputPath} and parsing CSV…`)
  try {
    const items = await loadLootTable(inputPath)
    console.log(`${items.length} items parsed.`)
    saveResults(output || ASSETS.LOOT_TABLE_JSON, stringify(items))
  } catch (errors) {
    console.error('Failed to load or parse CSV!', errors)
  }
}

function loadJson(path, description = 'data') {
  console.log(`Loading ${description} from ${path}…`)
  const source = readFileSync(path)
  return JSON.parse(source)
}

async function fetchDetails(input, output) {
  const items = loadJson(resolve(input || ASSETS.LOOT_TABLE_JSON), 'loot table')
  console.log(`Fetching item details…`)
  for (let i = 0, l = items.length; i < l; ++i) {
    renderProgressBar(i, l)
    const { url } = items[i]
    items[i].item = await loadItemDetails(url)
  }
  saveResults(output || ASSETS.DETAILS_JSON, stringify(items))
}

const EXPORT_FIELDS = {
  ZEPHAN: {
    ItemSlot: 'item.properties.slot',
    Slot: 'item.inventorySlot',
    Item: 'itemName',
    Location: 'instanceName',
    Boss: 'sourceName',
    Sta: 'item.equip.sta',
    Int: 'item.equip.int',
    Spi: 'item.equip.spi',
    Dmg: 'item.equip.spldmg',
    DvUD: undefined,
    ShD: 'item.equip.shasplpwr',
    FrD: 'item.equip.firsplpwr',
    Hit: 'item.equip.splhitrtng',
    Crit: 'item.equip.splcritstrkrtng',
    Haste: 'item.equip.splhastertng',
    Mp5: 'item.equip.manarng',
    Pen: 'item.equip.splpen',
    /* meta: 1, red: 2, yellow: 3, blue: 4 */
    Gem: ({
      item: {
        equip: { socket1, socket2, socket3, socket4 }
      }
    }) =>
      [socket1, socket2, socket3, socket4]
        .map(num => ({ 2: 'R', 3: 'Y', 4: 'B' }[num]))
        .filter(Boolean)
        .join(''),
    Meta: ({
      item: {
        equip: { socket1, socket2, socket3, socket4 }
      }
    }) => ([socket1, socket2, socket3, socket4].indexOf(1) === -1 ? '' : 1),
    Type: '',
    Amount: '',
    Resi: 'item.equip.resirtng',
    Set: '',
    Note: '',
    'Socket Count': 'item.equip.nsockets'
  }
}
async function exportDetails(input, output, fields) {
  const items = loadJson(resolve(input || ASSETS.DETAILS_JSON), 'loot details')
  console.log(`Transforming to CSV…`)
  const csvString = await detailsToCsv(items, fields)
  saveResults(output || ASSETS.EXPORT_CSV, csvString)
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
    case 'fetch-details':
      return fetchDetails(input, output)
    case 'export-details':
      return exportDetails(input, output, EXPORT_FIELDS.ZEPHAN)
    default:
      console.log('No script selected.')
  }
}

app().then(
  () => process.exit(0),
  error => console.error(error) || process.exit(1)
)
