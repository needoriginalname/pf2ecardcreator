const EQUIPMENT_SEED_SCHEMA_VERSION = 1
const EQUIPMENT_SEED_SOURCE = 'website-seed'
const EQUIPMENT_SEED_SIGNATURE_KEY = 'pf2e-equipment-seed-signature-v1'
const EQUIPMENT_SEED_PATH = 'data/equipment-seed.json'

const SEED_EQUIPMENT_FIELDS = [
  'slug',
  'baseSlug',
  'foundryId',
  'name',
  'bulk',
  'sourceBook',
  'traits',
  'rarity',
  'type',
  'level',
  'description',
  'usage',
  'price',
  'priceGp',
  'treasureMultiplier',
  'lootCategories',
]

const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (!value || typeof value !== 'object') return JSON.stringify(value)

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(',')}}`
}

const createSeedSignature = (seedData) => {
  const content = stableStringify({
    schemaVersion: seedData.schemaVersion,
    version: seedData.version,
    items: seedData.items,
  })

  let hash = 0
  for (let index = 0; index < content.length; index += 1) {
    hash = (hash * 31 + content.charCodeAt(index)) >>> 0
  }

  return `${seedData.schemaVersion}:${seedData.version}:${seedData.items.length}:${hash.toString(16)}`
}

const pickSeedFields = (item) =>
  SEED_EQUIPMENT_FIELDS.reduce((seedItem, field) => {
    if (item[field] !== undefined) {
      seedItem[field] = item[field]
    }

    return seedItem
  }, {})

const normalizeSeedItems = (items, signature) =>
  items
    .map((item) => {
      const slug = String(item.slug || '').trim()
      const name = String(item.name || '').trim()

      if (!slug || !name) return null

      return {
        ...pickSeedFields(item),
        slug,
        name,
        traits: Array.isArray(item.traits) ? item.traits : [],
        lootCategories: Array.isArray(item.lootCategories) ? item.lootCategories : [],
        rarity: item.rarity || 'common',
        type: item.type || 'equipment',
        level: Number.isFinite(Number(item.level)) ? Number(item.level) : 0,
        priceGp: Number.isFinite(Number(item.priceGp)) ? Number(item.priceGp) : 0,
        importedFrom: EQUIPMENT_SEED_SOURCE,
        seedSignature: signature,
        importedAt: new Date().toISOString(),
      }
    })
    .filter(Boolean)

export const createEquipmentSeedExport = (equipment, version = new Date().toISOString()) => {
  const seedData = {
    schemaVersion: EQUIPMENT_SEED_SCHEMA_VERSION,
    version,
    generatedAt: new Date().toISOString(),
    itemCount: equipment.length,
    items: equipment.map(pickSeedFields).sort((first, second) => first.slug.localeCompare(second.slug)),
  }

  return {
    ...seedData,
    signature: createSeedSignature(seedData),
  }
}

export const parseEquipmentSeedJson = (value) => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value
  const seedData = Array.isArray(parsed)
    ? createEquipmentSeedExport(parsed, 'legacy-array')
    : {
        schemaVersion: parsed.schemaVersion ?? EQUIPMENT_SEED_SCHEMA_VERSION,
        version: parsed.version ?? parsed.generatedAt ?? 'unversioned',
        generatedAt: parsed.generatedAt ?? '',
        itemCount: parsed.itemCount ?? parsed.items?.length ?? 0,
        signature: parsed.signature,
        items: parsed.items ?? [],
      }

  if (!Array.isArray(seedData.items)) {
    throw new Error('Equipment seed JSON must contain an items array.')
  }

  const signature = seedData.signature || createSeedSignature(seedData)

  return {
    ...seedData,
    signature,
    items: normalizeSeedItems(seedData.items, signature),
  }
}

export const fetchHostedEquipmentSeed = async () => {
  const response = await fetch(getEquipmentSeedUrl(), { cache: 'no-store' })

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Could not load hosted equipment seed (${response.status}).`)

  return parseEquipmentSeedJson(await response.text())
}

export const getStoredEquipmentSeedSignature = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(EQUIPMENT_SEED_SIGNATURE_KEY) || ''
}

export const setStoredEquipmentSeedSignature = (signature) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(EQUIPMENT_SEED_SIGNATURE_KEY, signature)
}

export const getEquipmentSeedUrl = () => `${import.meta.env.BASE_URL}${EQUIPMENT_SEED_PATH}`
