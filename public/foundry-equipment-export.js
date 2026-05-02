/* global game, ui */

const pack = game.packs.get('pf2e.equipment-srd')
const items = await pack.getDocuments()
const equipment = items.map((item) => item.toObject())
const json = JSON.stringify(equipment, null, 2)

try {
  await navigator.clipboard.writeText(json)
  ui.notifications.info(`Copied ${equipment.length} equipment items.`)
} catch {
  console.log(json)
  ui.notifications.warn('Clipboard was blocked. Equipment JSON was printed to the console instead.')
}
