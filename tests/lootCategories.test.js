import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import test from 'node:test'
import { parseFoundryEquipmentJson } from '../src/utils/foundryEquipment.js'

const FIXTURE_DIR = new URL('./loot-category-files/', import.meta.url)

const readConfig = async (fileName) => readFile(new URL(fileName, FIXTURE_DIR), 'utf8')

const parseSingleFoundryFile = async (fileName) => {
  const equipment = parseFoundryEquipmentJson(await readConfig(fileName))

  assert.equal(equipment.length, 1, `${fileName} should import exactly one item.`)
  return equipment[0]
}

const verifyFoundryType = (item, expectedType) => {
  assert.equal(item.type, expectedType, `${item.name} expected type ${expectedType}, got ${item.type}`)
}

const verifyParsedCategory = (item, expectedCategory) => {
  assert.ok(
    item.lootCategories.includes(expectedCategory),
    `${item.name} expected category ${expectedCategory}. Got: ${item.lootCategories.join(', ') || 'none'}`,
  )
}

const verifyNotParsedCategory = (item, unexpectedCategory) => {
  assert.ok(
    !item.lootCategories.includes(unexpectedCategory),
    `${item.name} should not include category ${unexpectedCategory}. Got: ${item.lootCategories.join(', ')}`,
  )
}

const assertImportedItems = (equipment, expectations) => {
  expectations.forEach((expectation) => {
    const item = equipment.find((candidate) => {
      if (expectation.slug) return candidate.slug === expectation.slug
      return candidate.name.toLowerCase() === String(expectation.name || '').toLowerCase()
    })

    assert.ok(item, `Expected item was not found: ${expectation.slug || expectation.name}`)

    if (expectation.type) {
      verifyFoundryType(item, expectation.type)
    }

    ;(expectation.categories ?? []).forEach((category) => verifyParsedCategory(item, category))
  })
}

const summarizeFile = async (filePath, expectationsPath) => {
  const normalized = parseFoundryEquipmentJson(await readFile(filePath, 'utf8'))
  const categoryCounts = normalized.reduce((counts, item) => {
    const categories = item.lootCategories.length > 0 ? item.lootCategories : ['uncategorized']

    categories.forEach((category) => {
      counts[category] = (counts[category] ?? 0) + 1
    })
    return counts
  }, {})
  const uncategorized = normalized.filter((item) => item.lootCategories.length === 0).slice(0, 20)

  console.log(`Imported ${normalized.length.toLocaleString()} Foundry equipment records from ${filePath}.`)
  console.log('Loot category counts:')
  Object.entries(categoryCounts)
    .sort((first, second) => second[1] - first[1] || first[0].localeCompare(second[0]))
    .forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })

  if (uncategorized.length > 0) {
    console.log('Uncategorized examples:')
    uncategorized.forEach((item) => {
      console.log(`  ${item.name} (${item.type}; traits: ${item.traits.join(', ') || 'none'})`)
    })
  }

  if (expectationsPath) {
    const expectations = JSON.parse(await readFile(expectationsPath, 'utf8'))
    assertImportedItems(normalized, expectations)
    console.log(`Passed ${expectations.length} file expectation checks from ${expectationsPath}.`)
  }
}

async function testMundaneWeaponFile() {
  const item = await parseSingleFoundryFile('mundane-weapon.json')

  verifyFoundryType(item, 'weapon')
  verifyParsedCategory(item, 'weapons')
  verifyParsedCategory(item, 'mundane-weapons')
}

async function testSpecificMagicWeaponFile() {
  const item = await parseSingleFoundryFile('specific-weapon.json')

  verifyFoundryType(item, 'weapon')
  verifyParsedCategory(item, 'weapons')
  verifyParsedCategory(item, 'specific-weapons')
}

async function testAlchemicalBombFile() {
  const item = await parseSingleFoundryFile('alchemical-bomb.json')

  verifyFoundryType(item, 'weapon')
  verifyParsedCategory(item, 'alchemical-items')
  verifyParsedCategory(item, 'alchemical-bombs')
  verifyNotParsedCategory(item, 'weapons')
  verifyNotParsedCategory(item, 'mundane-weapons')
}

async function testPotionFile() {
  const item = await parseSingleFoundryFile('potion.json')

  verifyFoundryType(item, 'consumable')
  verifyParsedCategory(item, 'non-alchemical-consumables')
  verifyParsedCategory(item, 'potions')
}

async function testArmorRuneFile() {
  const item = await parseSingleFoundryFile('armor-rune.json')

  verifyFoundryType(item, 'equipment')
  verifyParsedCategory(item, 'runes')
  verifyParsedCategory(item, 'fundamental-armor-runes')
}

async function testMundaneShieldFile() {
  const item = await parseSingleFoundryFile('mundane-shield.json')

  verifyFoundryType(item, 'shield')
  verifyParsedCategory(item, 'shields')
  verifyParsedCategory(item, 'mundane-shields')
}

async function testFundamentalWeaponRuneFile() {
  const item = await parseSingleFoundryFile('fundamental-weapon-rune.json')

  verifyFoundryType(item, 'equipment')
  verifyParsedCategory(item, 'runes')
  verifyParsedCategory(item, 'fundamental-weapon-runes')
  verifyNotParsedCategory(item, 'property-weapon-runes')
}

async function testPropertyWeaponRuneFile() {
  const item = await parseSingleFoundryFile('property-weapon-rune.json')

  verifyFoundryType(item, 'equipment')
  verifyParsedCategory(item, 'runes')
  verifyParsedCategory(item, 'property-weapon-runes')
  verifyNotParsedCategory(item, 'fundamental-weapon-runes')
}

async function testOtherMagicItemFile() {
  const item = await parseSingleFoundryFile('other-magic-item.json')

  verifyFoundryType(item, 'equipment')
  verifyParsedCategory(item, 'other-magic-items')
  verifyNotParsedCategory(item, 'other-items')
}

async function testOtherItemFile() {
  const item = await parseSingleFoundryFile('other-item.json')

  verifyFoundryType(item, 'equipment')
  verifyParsedCategory(item, 'other-items')
  verifyNotParsedCategory(item, 'other-magic-items')
}

async function testAllFixtureFilesAreCategorized() {
  const fixtureFiles = (await readdir(FIXTURE_DIR)).filter((fileName) => fileName.endsWith('.json'))

  for (const fixtureFile of fixtureFiles) {
    const item = await parseSingleFoundryFile(fixtureFile)

    assert.ok(
      item.lootCategories.length > 0,
      `${fixtureFile} imported ${item.name} as uncategorized.`,
    )
  }
}

test('mundane weapon file', testMundaneWeaponFile)
test('specific magic weapon file', testSpecificMagicWeaponFile)
test('alchemical bomb file', testAlchemicalBombFile)
test('potion file', testPotionFile)
test('armor rune file', testArmorRuneFile)
test('mundane shield file', testMundaneShieldFile)
test('fundamental weapon rune file', testFundamentalWeaponRuneFile)
test('property weapon rune file', testPropertyWeaponRuneFile)
test('other magic item file', testOtherMagicItemFile)
test('other item file', testOtherItemFile)
test('all fixture files are categorized', testAllFixtureFilesAreCategorized)

const filePath = process.argv[2]
if (filePath) {
  test(`summarize Foundry file: ${filePath}`, async () => {
    await summarizeFile(filePath, process.argv[3])
  })
}
