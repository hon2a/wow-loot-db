const parseArgs = require('minimist')
const { writeFileSync } = require('fs')
const { resolve } = require('path')

const { loadLootTable } = require('./scripts')

async function app() {
  const {
    _: [script],
    input,
    output
  } = parseArgs(process.argv.slice(2), { string: ['input', 'output'] })
  switch (script) {
    case 'loot-to-json':
      const data = await loadLootTable(resolve(input || './assets/tbc-loot-table.csv'))
      const outputPath = output || resolve(output || './assets/tbc-loot-table.json')
      writeFileSync(outputPath, JSON.stringify(data, null, 2), { encoding: 'utf-8' })
      console.log(`Results saved to ${outputPath}.`)
      break
    default:
      console.log('No script selected.')
  }
}

app().then(
  () => process.exit(0),
  error => console.error(error) || process.exit(1)
)
