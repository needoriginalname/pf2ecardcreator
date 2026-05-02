import { classifyEquipmentCategories } from '../constants/lootCategories.js'

const TREASURE_MULTIPLIERS = [1, 2, 3, 4]

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

const stripHtml = (value) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

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

const getPriceGpValue = (price) => {
  if (!price) return 0

  if (typeof price === 'string') {
    const coinValues = { pp: 10, gp: 1, sp: 0.1, cp: 0.01 }
    const matches = [...price.matchAll(/([\d.]+)\s*(pp|gp|sp|cp)/gi)]

    return matches.reduce((total, match) => total + Number(match[1]) * coinValues[match[2].toLowerCase()], 0)
  }

  if (typeof price === 'object') {
    return (
      Number(price.pp ?? 0) * 10 +
      Number(price.gp ?? 0) +
      Number(price.sp ?? 0) * 0.1 +
      Number(price.cp ?? 0) * 0.01
    )
  }

  return 0
}

const formatGpPrice = (value) => `${Math.round(value * 100) / 100} gp`

const getPrice = (system) => {
  const price = system.price?.value ?? system.price
  const formatted = typeof price === 'string' ? price : formatPriceObject(price)

  return formatted || '0 gp'
}

const getLevel = (system) => {
  const level = Number(system.level?.value ?? system.level ?? 0)

  return Number.isFinite(level) ? level : 0
}

const getType = (item, system) =>
  item.type ??
  system.category ??
  system.consumableType?.value ??
  system.subcategory ??
  system.group ??
  'equipment'

const isTreasureType = (type) => String(type || '').toLowerCase() === 'treasure'

const getDescription = (system) =>
  stripHtml(system.description?.value ?? system.description?.gm ?? system.description ?? '')

const getUsage = (system) =>
  String(system.usage?.value ?? system.usage ?? system.equipped?.usage ?? '').trim()

const toArray = (rawData) => {
  if (Array.isArray(rawData)) return rawData
  if (rawData?.name && (rawData?.system || rawData?.data)) return [rawData]
  if (Array.isArray(rawData?.items)) return rawData.items
  if (Array.isArray(rawData?.equipment)) return rawData.equipment
  if (rawData && typeof rawData === 'object') return Object.values(rawData)
  return []
}

export const normalizeFoundryEquipment = (rawData) => {
  const importedAt = new Date().toISOString()

  return toArray(rawData)
    .flatMap((item) => {
      const system = getSystem(item)
      const name = String(item.name ?? '').trim()
      const slug = normalizeSlug(item.slug ?? system.slug ?? name)
      const sourceBook = getSourceBook(system)

      if (!name || !slug) return null

      const normalizedItem = {
        slug,
        foundryId: item._id ?? item.id ?? '',
        name,
        bulk: getBulk(system),
        sourceBook: normalizeSourceBook(sourceBook),
        traits: getTraits(system),
        rarity: getRarity(system),
        type: getType(item, system),
        level: getLevel(system),
        description: getDescription(system),
        usage: getUsage(system),
        price: getPrice(system),
        priceGp: getPriceGpValue(system.price?.value ?? system.price),
        importedAt,
      }

      const lootCategories = classifyEquipmentCategories(normalizedItem)

      if (!isTreasureType(normalizedItem.type)) {
        return {
          ...normalizedItem,
          lootCategories,
        }
      }

      return TREASURE_MULTIPLIERS.map((multiplier) => {
        const priceGp = normalizedItem.priceGp * multiplier

        return {
          ...normalizedItem,
          slug: multiplier === 1 ? normalizedItem.slug : `${normalizedItem.slug}-${multiplier}x`,
          baseSlug: normalizedItem.slug,
          name: multiplier === 1 ? normalizedItem.name : `${normalizedItem.name} (${multiplier}x value)`,
          price: formatGpPrice(priceGp),
          priceGp,
          treasureMultiplier: multiplier,
          lootCategories,
        }
      })
    })
    .filter(Boolean)
}

export const parseFoundryEquipmentJson = (value) => normalizeFoundryEquipment(JSON.parse(value))

export const getEquipmentSummary = (equipment) =>
  equipment.reduce(
    (summary, item) => {
      summary.rarities[item.rarity] = (summary.rarities[item.rarity] ?? 0) + 1
      summary.types[item.type] = (summary.types[item.type] ?? 0) + 1
      ;(item.lootCategories ?? []).forEach((category) => {
        summary.lootCategories[category] = (summary.lootCategories[category] ?? 0) + 1
      })
      return summary
    },
    { rarities: {}, types: {}, lootCategories: {} },
  )

export const labelFromId = titleCase
