const normalizeText = (value) => String(value || '').toLowerCase()
const normalizeName = (item) => normalizeText(item.name)

const hasTrait = (item, trait) => {
  const expected = normalizeText(trait).replace(/\s+/g, '-')

  return (item.traits ?? []).some((itemTrait) => {
    const normalizedTrait = normalizeText(itemTrait).replace(/\s+/g, '-')
    return normalizedTrait === expected
  })
}

const hasAnyTrait = (item, traits) => traits.some((trait) => hasTrait(item, trait))
const hasType = (item, type) => normalizeText(item.type) === normalizeText(type)
const hasDescription = (item, text) => normalizeText(item.description).includes(normalizeText(text))
const hasUsageMatch = (item, pattern) => pattern.test(normalizeText(item.usage))

const isAlchemical = (item) => hasTrait(item, 'alchemical')
const isConsumable = (item) => hasType(item, 'consumable') || hasTrait(item, 'consumable')
const isArmor = (item) => hasType(item, 'armor')
const isShield = (item) => hasType(item, 'shield') || hasTrait(item, 'shield')
const isWeapon = (item) => hasType(item, 'weapon') || hasTrait(item, 'weapon')
const isMagical = (item) => hasTrait(item, 'magical')
const isRune = (item) => hasUsageMatch(item, /\b(etched|applied)\b/)
const isAlchemicalItem = (item) => isAlchemical(item) && (isWeapon(item) || isConsumable(item))
const isFundamentalWeaponRune = (item) => /\b(weapon potency|striking)\b/.test(normalizeName(item))
const isFundamentalArmorRune = (item) => /\b(armor potency|resilient)\b/.test(normalizeName(item))

const hasMatchedSubcategory = (item, category) =>
  (category.subsettings ?? [])
    .filter((subcategory) => !subcategory.isOther)
    .some((subcategory) => subcategory.matcher?.(item))

export const CATEGORY_OPTIONS = [
  {
    id: 'alchemical-items',
    label: 'Alchemical Items',
    matcher: isAlchemicalItem,
    subsettings: [
      {
        id: 'alchemical-bombs',
        label: 'Alchemical Bombs',
        matcher: (item) => isAlchemicalItem(item) && hasTrait(item, 'bomb'),
      },
      {
        id: 'alchemical-elixirs',
        label: 'Alchemical Elixirs',
        matcher: (item) => isAlchemicalItem(item) && hasAnyTrait(item, ['elixir', 'elixer']),
      },
      {
        id: 'alchemical-ammunition',
        label: 'Alchemical Ammunition',
        matcher: (item) => isAlchemicalItem(item) && hasDescription(item, 'ammunition'),
      },
      {
        id: 'alchemical-poisons',
        label: 'Alchemical Poisons',
        matcher: (item) => isAlchemicalItem(item) && hasTrait(item, 'poison'),
      },
      { id: 'drugs', label: 'Drugs', matcher: (item) => isAlchemicalItem(item) && hasTrait(item, 'drug') },
      {
        id: 'other-alchemical-consumables',
        label: 'Other Alchemical Consumables',
        matcher: (item) =>
          isAlchemicalItem(item) && isConsumable(item) && !hasMatchedSubcategory(item, CATEGORY_OPTIONS[0]),
        isOther: true,
      },
      {
        id: 'other-alchemical-items',
        label: 'Other Alchemical Items',
        matcher: (item) =>
          isAlchemicalItem(item) && !isConsumable(item) && !hasMatchedSubcategory(item, CATEGORY_OPTIONS[0]),
        isOther: true,
      },
    ],
  },
  { id: 'apex-items', label: 'Apex Items', matcher: (item) => hasTrait(item, 'apex') },
  {
    id: 'armor',
    label: 'Armor',
    matcher: isArmor,
    subsettings: [
      { id: 'magic-armor', label: 'Magic Armor', matcher: (item) => isArmor(item) && isMagical(item) },
      { id: 'mundane-armor', label: 'Mundane Armor', matcher: (item) => isArmor(item) && !isMagical(item) },
    ],
  },
  {
    id: 'banners',
    label: 'Banners',
    matcher: (item) => !isConsumable(item) && !isArmor(item) && hasTrait(item, 'aura'),
  },
  {
    id: 'non-alchemical-consumables',
    label: 'Non-Alchemical Consumables',
    matcher: (item) => isConsumable(item) && !isAlchemical(item),
    subsettings: [
      {
        id: 'bottled-breath',
        label: 'Bottled Breath',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasAnyTrait(item, ['bottled-breath', 'bottle-breath']),
      },
      { id: 'fulu', label: 'Fulu', matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'fulu') },
      {
        id: 'gadgets',
        label: 'Gadgets',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'gadget'),
      },
      {
        id: 'magical-ammunition',
        label: 'Magical Ammunition',
        matcher: (item) =>
          isConsumable(item) && !isAlchemical(item) && isMagical(item) && hasDescription(item, 'ammunition'),
      },
      {
        id: 'missives',
        label: 'Missives',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'missive'),
      },
      { id: 'oils', label: 'Oils', matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'oil') },
      {
        id: 'potions',
        label: 'Potions',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'potion'),
      },
      {
        id: 'scrolls',
        label: 'Scrolls',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'scroll'),
      },
      {
        id: 'spell-catalysts',
        label: 'Spell Catalysts',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'catalyst'),
      },
      {
        id: 'talismans',
        label: 'Talismans',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'talisman'),
      },
      { id: 'tea', label: 'Tea', matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'tea') },
      {
        id: 'whetstones',
        label: 'Whetstones',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && hasTrait(item, 'whetstone'),
      },
      {
        id: 'other-consumables',
        label: 'Other Consumables',
        matcher: (item) => isConsumable(item) && !isAlchemical(item) && !hasMatchedSubcategory(item, CATEGORY_OPTIONS[4]),
        isOther: true,
      },
    ],
  },
  { id: 'cursed-items', label: 'Cursed Items', enabled: false, matcher: (item) => hasTrait(item, 'cursed') },
  { id: 'grimoire', label: 'Grimoire', matcher: (item) => hasTrait(item, 'grimoire') },
  { id: 'high-tech-items', label: 'High Tech Items', matcher: (item) => hasTrait(item, 'tech') },
  { id: 'intelligent-items', label: 'Intelligent Items', matcher: (item) => hasTrait(item, 'intelligent') },
  { id: 'precious-materials', label: 'Precious Materials', matcher: (item) => hasTrait(item, 'precious') },
  {
    id: 'runes',
    label: 'Runes',
    matcher: isRune,
    subsettings: [
      {
        id: 'fundamental-armor-runes',
        label: 'Fundamental Armor Runes',
        matcher: (item) =>
          isRune(item) &&
          hasUsageMatch(item, /\b(etched|applied)\b.*\barmor\b|\barmor\b.*\b(etched|applied)\b/) &&
          isFundamentalArmorRune(item),
      },
      {
        id: 'property-armor-runes',
        label: 'Property Armor Runes',
        matcher: (item) =>
          isRune(item) &&
          hasUsageMatch(item, /\b(etched|applied)\b.*\barmor\b|\barmor\b.*\b(etched|applied)\b/) &&
          !isFundamentalArmorRune(item),
      },
      {
        id: 'fundamental-weapon-runes',
        label: 'Fundamental Weapon Runes',
        matcher: (item) =>
          isRune(item) &&
          hasUsageMatch(item, /\b(etched|applied)\b.*\bweapons?\b|\bweapons?\b.*\b(etched|applied)\b/) &&
          isFundamentalWeaponRune(item),
      },
      {
        id: 'property-weapon-runes',
        label: 'Property Weapon Runes',
        matcher: (item) =>
          isRune(item) &&
          hasUsageMatch(item, /\b(etched|applied)\b.*\bweapons?\b|\bweapons?\b.*\b(etched|applied)\b/) &&
          !isFundamentalWeaponRune(item),
      },
      {
        id: 'other-runes',
        label: 'Other Runes',
        matcher: (item) => isRune(item) && !hasMatchedSubcategory(item, CATEGORY_OPTIONS[10]),
        isOther: true,
      },
    ],
  },
  {
    id: 'shields',
    label: 'Shields',
    matcher: isShield,
    subsettings: [
      { id: 'specific-shields', label: 'Specific Shields', matcher: (item) => isShield(item) && isMagical(item) },
      { id: 'mundane-shields', label: 'Mundane Shields', matcher: (item) => isShield(item) && !isMagical(item) },
    ],
  },
  { id: 'snares', label: 'Snares', matcher: (item) => hasTrait(item, 'snare') },
  { id: 'spellhearts', label: 'Spellhearts', matcher: (item) => hasTrait(item, 'spellheart') },
  { id: 'staves', label: 'Staves', matcher: (item) => hasTrait(item, 'staff') },
  { id: 'wands', label: 'Wands', matcher: (item) => hasTrait(item, 'wand') },
  {
    id: 'weapons',
    label: 'Weapons',
    matcher: (item) => isWeapon(item) && !isAlchemical(item) && !isConsumable(item),
    subsettings: [
      {
        id: 'specific-weapons',
        label: 'Specific Weapons',
        matcher: (item) => isWeapon(item) && !isAlchemical(item) && !isConsumable(item) && isMagical(item),
      },
      {
        id: 'mundane-weapons',
        label: 'Mundane Weapons',
        matcher: (item) => isWeapon(item) && !isAlchemical(item) && !isConsumable(item) && !isMagical(item),
      },
    ],
  },
  { id: 'other-magic-items', label: 'Other Magic Items', isFallback: true },
  { id: 'other-items', label: 'Other Items', isFallback: true },
]

export const stripLootCategoryMatchers = (categories = CATEGORY_OPTIONS) =>
  categories.map(({ matcher, isOther, isFallback, subsettings = [], ...category }) => ({
    ...category,
    subsettings: stripLootCategoryMatchers(subsettings),
  }))

const collectCategoryMatches = (item, categories) => {
  const matches = []

  categories.forEach((category) => {
    if (!category.matcher?.(item)) return

    matches.push(category.id)
    matches.push(...collectCategoryMatches(item, category.subsettings ?? []))
  })

  return matches
}

export const classifyEquipmentCategories = (item) => {
  const matches = collectCategoryMatches(
    item,
    CATEGORY_OPTIONS.filter((category) => !category.isFallback),
  )

  if (matches.length === 0) {
    matches.push(isMagical(item) ? 'other-magic-items' : 'other-items')
  }

  return matches
}
