const normalizeSlug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const titleCase = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const getSystem = (item) => item.system ?? item.data?.data ?? item.data?.system ?? {}

const getSourceBook = (system) =>
  system.publication?.title ??
  system.publication?.name ??
  system.source?.value ??
  system.source ??
  ''

const normalizeSourceBook = (sourceBook) => {
  if (/#\s*\d+/.test(sourceBook) || /\b\d{1,2}-\d{2}\b/.test(sourceBook)) {
    return 'Other AP/Society Games'
  }

  return sourceBook
}

const getTraits = (system) => {
  const rawTraits = system.traits?.value ?? system.traits ?? []

  if (Array.isArray(rawTraits)) return rawTraits.map(String).filter(Boolean)
  if (typeof rawTraits === 'string') return rawTraits.split(',').map((trait) => trait.trim()).filter(Boolean)
  if (rawTraits && typeof rawTraits === 'object') return Object.values(rawTraits).map(String).filter(Boolean)

  return []
}

const getBulk = (system) => {
  const bulk = system.bulk?.value ?? system.bulk?.bulk ?? system.bulk

  if (bulk === null || bulk === undefined || bulk === '') return ''
  if (bulk === 0) return '-'
  return String(bulk)
}

const getRarity = (system) => system.traits?.rarity ?? system.rarity ?? 'common'

const formatPriceObject = (price) => {
  if (!price || typeof price !== 'object') return ''

  return ['pp', 'gp', 'sp', 'cp']
    .map((coin) => [coin, Number(price[coin])])
    .filter(([, amount]) => Number.isFinite(amount) && amount > 0)
    .map(([coin, amount]) => `${amount} ${coin}`)
    .join(', ')
}

const getPrice = (system) => {
  const price = system.price?.value ?? system.price
  const formatted = typeof price === 'string' ? price : formatPriceObject(price)

  return formatted || '0 gp'
}

const getType = (item, system) =>
  system.category ??
  system.consumableType?.value ??
  system.subcategory ??
  system.group ??
  item.type ??
  'equipment'

const toArray = (rawData) => {
  if (Array.isArray(rawData)) return rawData
  if (Array.isArray(rawData?.items)) return rawData.items
  if (Array.isArray(rawData?.equipment)) return rawData.equipment
  if (rawData && typeof rawData === 'object') return Object.values(rawData)
  return []
}

export const normalizeFoundryEquipment = (rawData) => {
  const importedAt = new Date().toISOString()

  return toArray(rawData)
    .map((item) => {
      const system = getSystem(item)
      const name = String(item.name ?? '').trim()
      const slug = normalizeSlug(item.slug ?? system.slug ?? name)
      const sourceBook = getSourceBook(system)

      if (!name || !slug) return null

      return {
        slug,
        foundryId: item._id ?? item.id ?? '',
        name,
        bulk: getBulk(system),
        sourceBook: normalizeSourceBook(sourceBook),
        traits: getTraits(system),
        rarity: getRarity(system),
        type: getType(item, system),
        price: getPrice(system),
        importedAt,
      }
    })
    .filter(Boolean)
}

export const parseFoundryEquipmentJson = (value) => normalizeFoundryEquipment(JSON.parse(value))

export const getEquipmentSummary = (equipment) =>
  equipment.reduce(
    (summary, item) => {
      summary.rarities[item.rarity] = (summary.rarities[item.rarity] ?? 0) + 1
      summary.types[item.type] = (summary.types[item.type] ?? 0) + 1
      return summary
    },
    { rarities: {}, types: {} },
  )

export const labelFromId = titleCase
