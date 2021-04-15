const { fetchUrl } = require('fetch')
const { parse } = require('fast-xml-parser')

const fetchItemDetails = url =>
  new Promise((resolve, reject) =>
    fetchUrl(`${url}&xml`, {}, (error, meta, body) => (error ? reject(error) : resolve(body.toString())))
  )

const parseJsonBodyString = string => JSON.parse(`{${string}}`)

async function loadItemDetails(url) {
  const xml = await fetchItemDetails(url)
  const {
    wowhead: {
      item: { name, level, class: cls, subclass, icon, inventorySlot, json, jsonEquip, link }
    }
  } = parse(xml)
  return {
    name,
    level,
    class: cls,
    subclass,
    icon,
    inventorySlot,
    properties: parseJsonBodyString(json),
    equip: parseJsonBodyString(jsonEquip),
    link
  }
}

module.exports = { loadItemDetails }
