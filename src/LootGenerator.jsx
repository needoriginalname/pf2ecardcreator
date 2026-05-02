import { useMemo, useState } from 'react'
import {
  MdArrowBack,
  MdAutoAwesome,
  MdDelete,
  MdExpandMore,
  MdRefresh,
  MdSave,
  MdTune,
} from 'react-icons/md'
import { CATEGORY_OPTIONS } from './constants/lootCategories.js'
import { getAllEquipment } from './utils/equipmentDatabase.js'

const CUSTOM_PRESET_STORAGE_KEY = 'pf2e-loot-custom-presets-v1'
const LEVEL_OPTIONS = Array.from({ length: 26 }, (_, index) => index - 1)
const LEVEL_SPREAD_OPTIONS = [0, 1, 2, 3, 4]
const DEFAULT_TARGET_LEVEL = 1
const DEFAULT_LEVEL_SPREAD = 1
const DEFAULT_GP_BUDGET = 100
const DEFAULT_MIN_ITEM_COUNT = 1
const DEFAULT_MAX_ITEM_COUNT = 4
const MIN_GP_BUDGET = 1
const MAX_GP_BUDGET = 100000
const MIN_ITEM_COUNT = 1
const MAX_ITEM_COUNT = 20
const TREASURE_CATEGORY_ID = 'treasure'
const RARITY_OPTIONS = [
  { id: 'common', label: 'Common', enabled: true, weight: 100 },
  { id: 'uncommon', label: 'Uncommon', enabled: true, weight: 40 },
  { id: 'rare', label: 'Rare', enabled: true, weight: 5 },
  { id: 'unique', label: 'Unique', enabled: false, weight: 0 },
]
const BUILT_IN_PRESET_DEFINITIONS = [
  {
    id: 'arcane-library',
    name: 'Arcane Library',
    weights: {
      grimoire: 90,
      scrolls: 85,
      wands: 70,
      staves: 55,
      'spell-catalysts': 55,
      'other-magic-items': 60,
      'non-alchemical-consumables': 35,
      weapons: 8,
      armor: 8,
      shields: 5,
      treasure: 5,
      'cursed-items': 0,
    },
  },
  {
    id: 'alchemist-lab',
    name: 'Alchemist Lab',
    weights: {
      'alchemical-items': 100,
      'alchemical-bombs': 90,
      'alchemical-elixirs': 80,
      'alchemical-poisons': 65,
      drugs: 40,
      'other-alchemical-consumables': 70,
      'other-alchemical-items': 45,
      'non-alchemical-consumables': 25,
      'other-items': 20,
      treasure: 4,
    },
  },
  {
    id: 'ancient-armory',
    name: 'Ancient Armory',
    weights: {
      weapons: 100,
      'mundane-weapons': 80,
      'specific-weapons': 55,
      armor: 85,
      'mundane-armor': 75,
      'magic-armor': 45,
      shields: 65,
      'mundane-shields': 60,
      runes: 55,
      'property-weapon-runes': 45,
      'property-armor-runes': 35,
      treasure: 6,
    },
  },
  {
    id: 'bandit-cache',
    name: 'Bandit Cache',
    weights: {
      weapons: 80,
      'mundane-weapons': 90,
      armor: 45,
      'mundane-armor': 60,
      shields: 35,
      'mundane-shields': 40,
      'non-alchemical-consumables': 30,
      potions: 35,
      'other-items': 70,
      'other-magic-items': 12,
      treasure: 56,
    },
  },
  {
    id: 'battlefield-salvage',
    name: 'Battlefield Salvage',
    weights: {
      weapons: 90,
      armor: 80,
      shields: 65,
      runes: 45,
      'alchemical-items': 35,
      'alchemical-bombs': 45,
      potions: 25,
      'mundane-weapons': 85,
      'mundane-armor': 70,
      'other-items': 55,
      treasure: 4,
    },
  },
  {
    id: 'catacombs',
    name: 'Catacombs',
    weights: {
      'cursed-items': 25,
      'other-magic-items': 55,
      scrolls: 40,
      talismans: 35,
      armor: 25,
      weapons: 25,
      'other-items': 40,
      'non-alchemical-consumables': 25,
      treasure: 45,
    },
  },
  {
    id: 'druid-grove',
    name: 'Druid Grove',
    weights: {
      potions: 70,
      tea: 65,
      talismans: 45,
      staves: 45,
      'other-magic-items': 55,
      'alchemical-elixirs': 35,
      'other-alchemical-consumables': 30,
      weapons: 10,
      armor: 10,
      treasure: 5,
    },
  },
  {
    id: 'dwarven-forge',
    name: 'Dwarven Forge',
    weights: {
      weapons: 80,
      armor: 80,
      shields: 70,
      runes: 85,
      'fundamental-weapon-runes': 75,
      'fundamental-armor-runes': 75,
      'precious-materials': 85,
      'specific-weapons': 45,
      'magic-armor': 45,
      treasure: 13,
    },
  },
  {
    id: 'fey-market',
    name: 'Fey Market',
    weights: {
      'other-magic-items': 85,
      wands: 45,
      scrolls: 45,
      potions: 55,
      talismans: 65,
      tea: 50,
      'cursed-items': 7,
      weapons: 15,
      armor: 10,
      treasure: 18,
    },
  },
  {
    id: 'haunted-manor',
    name: 'Haunted Manor',
    weights: {
      'cursed-items': 35,
      'other-magic-items': 65,
      grimoire: 45,
      scrolls: 50,
      wands: 35,
      'intelligent-items': 25,
      'other-items': 45,
      weapons: 15,
      treasure: 11,
    },
  },
  {
    id: 'holy-shrine',
    name: 'Holy Shrine',
    weights: {
      potions: 65,
      scrolls: 60,
      talismans: 55,
      wands: 40,
      staves: 35,
      'other-magic-items': 55,
      'cursed-items': 0,
      weapons: 10,
      armor: 20,
      shields: 25,
      treasure: 9,
    },
  },
  {
    id: 'kobold-warren',
    name: 'Kobold Warren',
    weights: {
      snares: 100,
      'alchemical-bombs': 65,
      'alchemical-items': 75,
      gadgets: 35,
      weapons: 35,
      'mundane-weapons': 45,
      'other-items': 65,
      potions: 20,
      treasure: 11,
    },
  },
  {
    id: 'mage-tower',
    name: 'Mage Tower',
    weights: {
      wands: 85,
      staves: 80,
      scrolls: 80,
      grimoire: 65,
      'spell-catalysts': 60,
      'other-magic-items': 85,
      runes: 30,
      'cursed-items': 6,
      weapons: 8,
      armor: 8,
      treasure: 10,
    },
  },
  {
    id: 'merchant-caravan',
    name: 'Merchant Caravan',
    weights: {
      'other-items': 100,
      potions: 45,
      scrolls: 35,
      weapons: 35,
      armor: 30,
      shields: 25,
      'precious-materials': 45,
      'other-magic-items': 35,
      'alchemical-items': 30,
      treasure: 23,
    },
  },
  {
    id: 'pirate-cove',
    name: 'Pirate Cove',
    weights: {
      weapons: 70,
      'mundane-weapons': 75,
      potions: 35,
      oils: 35,
      'magical-ammunition': 30,
      'other-items': 80,
      'precious-materials': 40,
      'cursed-items': 10,
      armor: 20,
      shields: 30,
      treasure: 75,
    },
  },
  {
    id: 'royal-vault',
    name: 'Royal Vault',
    weights: {
      'precious-materials': 100,
      'other-magic-items': 70,
      armor: 50,
      weapons: 50,
      shields: 45,
      runes: 45,
      'apex-items': 35,
      'intelligent-items': 15,
      potions: 20,
      treasure: 25,
    },
  },
  {
    id: 'sewer-hideout',
    name: 'Sewer Hideout',
    weights: {
      'alchemical-poisons': 70,
      drugs: 55,
      'alchemical-items': 70,
      'other-items': 70,
      weapons: 35,
      snares: 35,
      potions: 20,
      treasure: 6,
      'cursed-items': 0,
    },
  },
  {
    id: 'siege-camp',
    name: 'Siege Camp',
    weights: {
      weapons: 90,
      armor: 65,
      shields: 55,
      'alchemical-bombs': 70,
      'magical-ammunition': 55,
      'fundamental-weapon-runes': 45,
      'property-weapon-runes': 45,
      potions: 35,
      snares: 30,
      treasure: 2,
    },
  },
  {
    id: 'thieves-guild',
    name: 'Thieves Guild',
    weights: {
      talismans: 65,
      gadgets: 55,
      potions: 40,
      oils: 40,
      weapons: 45,
      'mundane-weapons': 50,
      'other-magic-items': 45,
      'other-items': 75,
      'cursed-items': 7,
      treasure: 55,
    },
  },
  {
    id: 'undead-crypt',
    name: 'Undead Crypt',
    weights: {
      'cursed-items': 40,
      'other-magic-items': 60,
      scrolls: 50,
      wands: 35,
      grimoire: 40,
      weapons: 35,
      armor: 30,
      talismans: 35,
      potions: 20,
      treasure: 13,
    },
  },
  {
    id: 'wizard-school',
    name: 'Wizard School',
    weights: {
      scrolls: 90,
      wands: 80,
      staves: 65,
      grimoire: 65,
      'spell-catalysts': 75,
      'other-magic-items': 70,
      potions: 35,
      'cursed-items': 2,
      weapons: 5,
      armor: 5,
      treasure: 20,
    },
  },
]

const formatLevel = (level) => (level === -1 ? '0 or lower' : String(level))

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getLevelRange = (targetLevel, levelSpread) => {
  const minimum = clamp(targetLevel - levelSpread, -1, 25)
  const maximum = clamp(targetLevel + levelSpread, -1, 25)

  return { minimum, maximum }
}

const formatLevelRange = ({ minimum, maximum }) => {
  if (minimum === maximum) return `Level ${formatLevel(minimum)}`

  return `Levels ${formatLevel(minimum)} to ${formatLevel(maximum)}`
}

const parseBudget = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return MIN_GP_BUDGET
  return clamp(Math.round(parsed), MIN_GP_BUDGET, MAX_GP_BUDGET)
}

const parseItemCount = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return MIN_ITEM_COUNT
  return clamp(Math.round(parsed), MIN_ITEM_COUNT, MAX_ITEM_COUNT)
}

const formatItemCountRange = (minimum, maximum) => {
  if (minimum === maximum) return `${minimum} item${minimum === 1 ? '' : 's'}`
  return `${minimum}-${maximum} items`
}

const getDefaultSettings = (options, defaultWeight = 100) =>
  options.reduce(
    (settings, option) => ({
      ...settings,
      [option.id]: {
        enabled: option.enabled ?? true,
        weight: option.weight ?? defaultWeight,
        subsettings: option.subsettings ? getDefaultSettings(option.subsettings, defaultWeight) : {},
      },
    }),
    {},
  )

const mergeSettings = (options, savedSettings = {}, defaultWeight = 100) => {
  const defaults = getDefaultSettings(options, defaultWeight)

  return options.reduce((settings, option) => {
    const savedSetting = savedSettings[option.id] ?? {}

    return {
      ...settings,
      [option.id]: {
        ...defaults[option.id],
        enabled:
          typeof savedSetting.enabled === 'boolean'
            ? savedSetting.enabled
            : defaults[option.id].enabled,
        weight:
          Number.isFinite(Number(savedSetting.weight))
            ? clamp(Math.round(Number(savedSetting.weight)), 0, 100)
            : defaults[option.id].weight,
        subsettings: option.subsettings
          ? mergeSettings(option.subsettings, savedSetting.subsettings, defaultWeight)
          : {},
      },
    }
  }, {})
}

const createPresetSettings = (options, weights, fallbackWeight = 8) =>
  options.reduce((settings, option) => {
    const hasWeight = Object.prototype.hasOwnProperty.call(weights, option.id)
    const defaultWeight = option.id === 'cursed-items' ? 0 : fallbackWeight
    const weight = hasWeight ? clamp(Math.round(Number(weights[option.id])), 0, 100) : defaultWeight

    return {
      ...settings,
      [option.id]: {
        enabled: weight > 0,
        weight,
        subsettings: option.subsettings ? createPresetSettings(option.subsettings, weights, fallbackWeight) : {},
      },
    }
  }, {})

const loadCustomPresets = () => {
  if (typeof window === 'undefined') return []

  try {
    const rawPresets = JSON.parse(window.localStorage.getItem(CUSTOM_PRESET_STORAGE_KEY) ?? '[]')
    if (!Array.isArray(rawPresets)) return []

    return rawPresets
      .filter((preset) => preset?.id && preset?.name && preset?.settings)
      .map((preset) => ({
        id: String(preset.id),
        name: String(preset.name),
        settings: mergeSettings(CATEGORY_OPTIONS, preset.settings),
      }))
  } catch {
    return []
  }
}

const saveCustomPresets = (presets) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CUSTOM_PRESET_STORAGE_KEY, JSON.stringify(presets))
}

const slugifyPresetName = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatGp = (value) => {
  const rounded = Math.round(value * 100) / 100
  return `${rounded.toLocaleString()} gp`
}

const labelFromId = (value) =>
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const parsePriceGp = (price) => {
  if (Number.isFinite(Number(price))) return Number(price)

  const coinValues = { pp: 10, gp: 1, sp: 0.1, cp: 0.01 }
  const matches = [...String(price || '').matchAll(/([\d.]+)\s*(pp|gp|sp|cp)/gi)]

  return matches.reduce((total, match) => total + Number(match[1]) * coinValues[match[2].toLowerCase()], 0)
}

const getItemLevel = (item) => {
  const level = Number(item.level ?? item.itemLevel)
  return Number.isFinite(level) ? level : null
}

const getItemPriceGp = (item) => {
  const price = Number.isFinite(Number(item.priceGp)) ? Number(item.priceGp) : parsePriceGp(item.price)
  return Number.isFinite(price) ? price : 0
}

const isTreasureLootItem = (item) =>
  String(item.type || '').toLowerCase() === 'treasure' || (item.lootCategories ?? []).includes(TREASURE_CATEGORY_ID)

const isItemInLevelRange = (item, levelRange) =>
  item.isTreasure ||
  (Number.isFinite(item.level) && item.level >= levelRange.minimum && item.level <= levelRange.maximum)

const getLootUniquenessKey = (item) => item.baseSlug ?? item.slug

const countUniqueLootCandidates = (items) => new Set(items.map(getLootUniquenessKey)).size

const formatGeneratedItemLevel = (item) => (item.isTreasure ? 'Any level' : `Level ${formatLevel(item.level)}`)

const flattenSettingWeights = (settings) =>
  Object.entries(settings).reduce((weights, [id, setting]) => {
    const nextWeights = {
      ...weights,
      [id]: setting.enabled ? setting.weight : 0,
    }

    return {
      ...nextWeights,
      ...flattenSettingWeights(setting.subsettings ?? {}),
    }
  }, {})

const getMatchingCategoryWeight = (itemCategories = [], categoryWeights) =>
  itemCategories.reduce((bestWeight, category) => Math.max(bestWeight, categoryWeights[category] ?? 0), 0)

const getWeightedRandomItem = (items) => {
  const totalWeight = items.reduce((total, item) => total + item.pickWeight, 0)
  if (totalWeight <= 0) return null

  let roll = Math.random() * totalWeight

  for (const item of items) {
    roll -= item.pickWeight
    if (roll <= 0) return item
  }

  return items.at(-1) ?? null
}

const getRandomInt = (minimum, maximum) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum

const scoreLootDraft = (items, targetGp) => {
  const totalValue = items.reduce((total, item) => total + item.priceGp, 0)
  return {
    items,
    totalValue,
    differenceRatio: Math.abs(totalValue - targetGp) / targetGp,
  }
}

const createWeightedLootDraft = (candidates, targetGp, minimumItems, maximumItems) => {
  const usableCandidateCount = countUniqueLootCandidates(candidates)
  if (usableCandidateCount < minimumItems) return null

  let bestDraft = null
  const attempts = 3000
  const usableMaximumItems = Math.min(maximumItems, usableCandidateCount)

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const itemCount = getRandomInt(minimumItems, usableMaximumItems)
    const remainingCandidates = [...candidates]
    const selectedItems = []

    while (selectedItems.length < itemCount && remainingCandidates.length > 0) {
      const remainingSlots = itemCount - selectedItems.length
      const remainingBudget = Math.max(0.01, targetGp - selectedItems.reduce((total, item) => total + item.priceGp, 0))
      const idealItemValue = remainingBudget / remainingSlots
      const weightedCandidates = remainingCandidates.map((candidate) => ({
        ...candidate,
        pickWeight:
          candidate.baseWeight *
          (1 / (1 + Math.abs(candidate.priceGp - idealItemValue) / Math.max(idealItemValue, 1))),
      }))
      const nextItem = getWeightedRandomItem(weightedCandidates)
      if (!nextItem) break

      selectedItems.push(nextItem)
      const selectedKey = getLootUniquenessKey(nextItem)
      for (let index = remainingCandidates.length - 1; index >= 0; index -= 1) {
        if (getLootUniquenessKey(remainingCandidates[index]) === selectedKey) {
          remainingCandidates.splice(index, 1)
        }
      }
    }

    if (selectedItems.length !== itemCount) continue

    const draft = scoreLootDraft(selectedItems, targetGp)
    if (!bestDraft || draft.differenceRatio < bestDraft.differenceRatio) {
      bestDraft = draft
    }

    if (draft.differenceRatio <= 0.1) break
  }

  return bestDraft
}

const getLootStatus = (draft, targetGp) => {
  if (!draft) return ''

  const differencePercent = Math.round(draft.differenceRatio * 100)
  if (draft.differenceRatio <= 0.1) {
    return `Generated ${draft.items.length} item${draft.items.length === 1 ? '' : 's'} within ${differencePercent}% of the GP target.`
  }
  if (draft.differenceRatio <= 0.15) {
    return `Generated the closest strong match, within ${differencePercent}% of the GP target.`
  }
  if (draft.totalValue < targetGp) {
    return `Closest match is ${differencePercent}% below the GP target. Matching items may not be valuable enough for this budget or item count.`
  }

  return `Closest match is ${differencePercent}% above the GP target. Matching items may be too expensive for this budget or item count.`
}

const parseSettingWeight = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return clamp(Math.round(parsed), 0, 100)
}

const countEnabledSettings = (settings) =>
  Object.values(settings).reduce((count, setting) => count + (setting.enabled ? 1 : 0), 0)

const createSettingRows = (options, settings, updateSetting, prefix) =>
  options.map((option) => {
    const setting = settings[option.id]

    return {
      id: `${prefix}-${option.id}`,
      label: option.label,
      enabled: setting.enabled,
      weight: setting.weight,
      onEnabledChange: (enabled) => updateSetting([option.id], { enabled }),
      onWeightChange: (weight) => updateSetting([option.id], { weight }),
      subsettings: option.subsettings
        ? createSettingRows(
            option.subsettings,
            setting.subsettings,
            (subsettingPath, nextSetting) =>
              updateSetting([option.id, 'subsettings', ...subsettingPath], nextSetting),
            `${prefix}-${option.id}`,
          )
        : [],
    }
  })

const updateNestedSetting = (settings, path, nextSetting) => {
  const [settingId, nestedKey, ...nestedPath] = path

  if (!nestedKey) {
    return {
      ...settings,
      [settingId]: {
        ...settings[settingId],
        ...nextSetting,
      },
    }
  }

  return {
    ...settings,
    [settingId]: {
      ...settings[settingId],
      subsettings: updateNestedSetting(settings[settingId].subsettings, nestedPath, nextSetting),
    },
  }
}

function LootSettingRow({
  id,
  label,
  enabled,
  weight,
  subsettings = [],
  onEnabledChange,
  onWeightChange,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const effectiveWeight = enabled ? weight : 0
  const hasSubsettings = subsettings.length > 0

  return (
    <div className={`loot-setting-row ${enabled ? '' : 'is-disabled'} ${isExpanded ? 'is-expanded' : ''}`}>
      <div className="loot-setting-main">
        {hasSubsettings && (
          <button
            type="button"
            className="loot-setting-expand"
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label} subcategories`}
          >
            <MdExpandMore aria-hidden="true" />
          </button>
        )}
        {!hasSubsettings && <span className="loot-setting-expand-spacer" aria-hidden="true" />}
        <label className="loot-setting-toggle" htmlFor={`${id}-enabled`}>
          <input
            id={`${id}-enabled`}
            type="checkbox"
            checked={enabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
          />
          <span>{label}</span>
        </label>
        <div className="loot-setting-slider">
          <input
            id={`${id}-weight`}
            type="range"
            min="0"
            max="100"
            step="1"
            value={weight}
            disabled={!enabled}
            onChange={(event) => onWeightChange(parseSettingWeight(event.target.value))}
            aria-label={`${label} weight`}
          />
          <output htmlFor={`${id}-weight`}>{effectiveWeight}</output>
        </div>
      </div>

      {hasSubsettings && isExpanded && (
        <div className="loot-subsetting-list" aria-label={`${label} subsettings`}>
          {subsettings.map((subsetting) => (
            <LootSettingRow key={subsetting.id} {...subsetting} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LootGenerator({ onBackHome }) {
  const [targetLevel, setTargetLevel] = useState(DEFAULT_TARGET_LEVEL)
  const [levelSpread, setLevelSpread] = useState(DEFAULT_LEVEL_SPREAD)
  const [gpBudget, setGpBudget] = useState(DEFAULT_GP_BUDGET)
  const [minItemCount, setMinItemCount] = useState(DEFAULT_MIN_ITEM_COUNT)
  const [maxItemCount, setMaxItemCount] = useState(DEFAULT_MAX_ITEM_COUNT)
  const [raritySettings, setRaritySettings] = useState(() => getDefaultSettings(RARITY_OPTIONS))
  const [categorySettings, setCategorySettings] = useState(() => getDefaultSettings(CATEGORY_OPTIONS))
  const [customPresets, setCustomPresets] = useState(loadCustomPresets)
  const [selectedPresetId, setSelectedPresetId] = useState('custom-current')
  const [customPresetName, setCustomPresetName] = useState('')
  const [lootDraft, setLootDraft] = useState(null)
  const [lootStatus, setLootStatus] = useState('')
  const [lootError, setLootError] = useState('')
  const [isGeneratingLoot, setIsGeneratingLoot] = useState(false)

  const levelRange = useMemo(() => getLevelRange(targetLevel, levelSpread), [targetLevel, levelSpread])
  const enabledRarityCount = useMemo(() => countEnabledSettings(raritySettings), [raritySettings])
  const enabledCategoryCount = useMemo(() => countEnabledSettings(categorySettings), [categorySettings])
  const generatedTotalValue = lootDraft?.totalValue ?? 0
  const selectedBuiltInPreset = useMemo(
    () => BUILT_IN_PRESET_DEFINITIONS.find((preset) => preset.id === selectedPresetId),
    [selectedPresetId],
  )
  const selectedCustomPreset = useMemo(
    () => customPresets.find((preset) => preset.id === selectedPresetId),
    [customPresets, selectedPresetId],
  )
  const rarityRows = useMemo(
    () =>
      createSettingRows(RARITY_OPTIONS, raritySettings, (path, nextSetting) => {
        setRaritySettings((currentSettings) => updateNestedSetting(currentSettings, path, nextSetting))
      }, 'loot-rarity'),
    [raritySettings],
  )
  const categoryRows = useMemo(
    () =>
      createSettingRows(CATEGORY_OPTIONS, categorySettings, (path, nextSetting) => {
        setCategorySettings((currentSettings) => updateNestedSetting(currentSettings, path, nextSetting))
      }, 'loot-category'),
    [categorySettings],
  )

  const persistCustomPresets = (nextPresets) => {
    setCustomPresets(nextPresets)
    saveCustomPresets(nextPresets)
  }

  const applyPresetById = (presetId) => {
    setSelectedPresetId(presetId)

    const builtInPreset = BUILT_IN_PRESET_DEFINITIONS.find((preset) => preset.id === presetId)
    if (builtInPreset) {
      setCategorySettings(createPresetSettings(CATEGORY_OPTIONS, builtInPreset.weights))
      setCustomPresetName(`${builtInPreset.name} Custom`)
      return
    }

    const customPreset = customPresets.find((preset) => preset.id === presetId)
    if (customPreset) {
      setCategorySettings(mergeSettings(CATEGORY_OPTIONS, customPreset.settings))
      setCustomPresetName(customPreset.name)
      return
    }

    setCustomPresetName('')
  }

  const createCustomPreset = () => {
    const name = customPresetName.trim()
    if (!name) return

    const nextPreset = {
      id: `custom-${slugifyPresetName(name) || 'preset'}-${Date.now()}`,
      name,
      settings: categorySettings,
    }
    const nextPresets = [...customPresets, nextPreset]

    persistCustomPresets(nextPresets)
    setSelectedPresetId(nextPreset.id)
  }

  const savePresetEdits = () => {
    if (selectedBuiltInPreset) {
      createCustomPreset()
      return
    }

    if (!selectedCustomPreset) return

    const name = customPresetName.trim() || selectedCustomPreset.name
    const nextPresets = customPresets.map((preset) =>
      preset.id === selectedCustomPreset.id
        ? {
            ...preset,
            name,
            settings: categorySettings,
          }
        : preset,
    )

    persistCustomPresets(nextPresets)
  }

  const deleteCustomPreset = () => {
    if (!selectedCustomPreset) return

    const nextPresets = customPresets.filter((preset) => preset.id !== selectedCustomPreset.id)
    persistCustomPresets(nextPresets)
    setSelectedPresetId('custom-current')
    setCustomPresetName('')
  }

  const updateMinItemCount = (value) => {
    const nextMin = parseItemCount(value)
    setMinItemCount(nextMin)
    setMaxItemCount((currentMax) => Math.max(currentMax, nextMin))
  }

  const updateMaxItemCount = (value) => {
    const nextMax = parseItemCount(value)
    setMaxItemCount(nextMax)
    setMinItemCount((currentMin) => Math.min(currentMin, nextMax))
  }

  const generateLoot = async () => {
    setIsGeneratingLoot(true)
    setLootError('')
    setLootStatus('')
    setLootDraft(null)

    try {
      const equipment = await getAllEquipment()

      if (equipment.length === 0) {
        setLootError('No imported equipment found. Import Foundry PF2e equipment before generating loot.')
        return
      }

      const rarityWeights = flattenSettingWeights(raritySettings)
      const categoryWeights = flattenSettingWeights(categorySettings)
      const candidates = equipment
        .map((item) => {
          const level = getItemLevel(item)
          const priceGp = getItemPriceGp(item)
          const rarity = String(item.rarity || 'common').toLowerCase()
          const rarityWeight = rarityWeights[rarity] ?? 0
          const categoryWeight = getMatchingCategoryWeight(item.lootCategories ?? [], categoryWeights)
          const isTreasure = isTreasureLootItem(item)

          return {
            ...item,
            level,
            priceGp,
            isTreasure,
            baseWeight: rarityWeight * categoryWeight,
          }
        })
        .filter(
          (item) =>
            isItemInLevelRange(item, levelRange) &&
            item.priceGp > 0 &&
            item.baseWeight > 0,
        )

      if (candidates.length === 0) {
        setLootError(
          `No imported items match enabled rarities, enabled categories, a nonzero GP value, and ${formatLevelRange(levelRange).toLowerCase()} for non-treasure items. Re-import equipment if your records do not have level/category data yet.`,
        )
        return
      }

      const uniqueCandidateCount = countUniqueLootCandidates(candidates)

      if (uniqueCandidateCount < minItemCount) {
        setLootError(
          `Only ${uniqueCandidateCount} matching item${uniqueCandidateCount === 1 ? '' : 's'} are available, but the minimum is ${minItemCount}. Lower the item count or broaden the filters.`,
        )
        return
      }

      const draft = createWeightedLootDraft(candidates, gpBudget, minItemCount, maxItemCount)
      if (!draft) {
        setLootError('Could not build a loot draft from the current matching items. Broaden the filters or lower the item count.')
        return
      }

      setLootDraft(draft)
      setLootStatus(getLootStatus(draft, gpBudget))
    } catch (error) {
      setLootError(error.message || 'Loot generation failed.')
    } finally {
      setIsGeneratingLoot(false)
    }
  }

  const resetLoot = () => {
    setTargetLevel(DEFAULT_TARGET_LEVEL)
    setLevelSpread(DEFAULT_LEVEL_SPREAD)
    setGpBudget(DEFAULT_GP_BUDGET)
    setMinItemCount(DEFAULT_MIN_ITEM_COUNT)
    setMaxItemCount(DEFAULT_MAX_ITEM_COUNT)
    setRaritySettings(getDefaultSettings(RARITY_OPTIONS))
    setCategorySettings(getDefaultSettings(CATEGORY_OPTIONS))
    setSelectedPresetId('custom-current')
    setCustomPresetName('')
    setLootDraft(null)
    setLootStatus('')
    setLootError('')
  }

  return (
    <main className="loot-shell">
      <header className="workspace-top-bar">
        <button type="button" className="home-back-button" onClick={onBackHome}>
          <MdArrowBack aria-hidden="true" />
          Home
        </button>
        <div>
          <p className="workspace-kicker">PF2e table tools</p>
          <h1>Loot Generator</h1>
          <p>Set the treasure target before the item picker starts rolling.</p>
        </div>
      </header>

      <section className="loot-workspace" aria-label="Loot generator workspace">
        <form className="loot-controls">
          <div className="loot-controls-heading">
            <MdTune aria-hidden="true" />
            <div>
              <h2>Generator Setup</h2>
              <p>Choose the item level window and the approximate treasure value.</p>
            </div>
          </div>

          <div className="loot-field">
            <label htmlFor="loot-level">Target level</label>
            <select
              id="loot-level"
              value={targetLevel}
              onChange={(event) => setTargetLevel(Number(event.target.value))}
            >
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  Level {formatLevel(level)}
                </option>
              ))}
            </select>
            <p className="loot-field-hint">The generator will bias results around this level.</p>
          </div>

          <div className="loot-field">
            <label htmlFor="loot-level-spread">Item level spread</label>
            <select
              id="loot-level-spread"
              value={levelSpread}
              onChange={(event) => setLevelSpread(Number(event.target.value))}
            >
              {LEVEL_SPREAD_OPTIONS.map((spread) => (
                <option key={spread} value={spread}>
                  {spread === 0 ? 'Exact level only' : `Within ${spread} level${spread === 1 ? '' : 's'}`}
                </option>
              ))}
            </select>
            <p className="loot-field-hint">Current pool: {formatLevelRange(levelRange)}.</p>
          </div>

          <div className="loot-field">
            <label htmlFor="loot-gp-budget">Rough GP value</label>
            <div className="loot-money-input">
              <input
                id="loot-gp-budget"
                type="number"
                min={MIN_GP_BUDGET}
                max={MAX_GP_BUDGET}
                step="5"
                value={gpBudget}
                onChange={(event) => setGpBudget(parseBudget(event.target.value))}
              />
              <span>gp</span>
            </div>
            <input
              className="loot-budget-slider"
              type="range"
              min="1"
              max="5000"
              step="25"
              value={Math.min(gpBudget, 5000)}
              onChange={(event) => setGpBudget(parseBudget(event.target.value))}
              aria-label="Rough GP value slider"
            />
            <p className="loot-field-hint">
              Use this as a target value, not an exact promise.
            </p>
          </div>

          <fieldset className="loot-fieldset loot-count-fieldset">
            <legend>Item count</legend>
            <div className="loot-range-control">
              <div
                className="loot-range-track"
                style={{
                  '--range-start': `${((minItemCount - MIN_ITEM_COUNT) / (MAX_ITEM_COUNT - MIN_ITEM_COUNT)) * 100}%`,
                  '--range-end': `${((maxItemCount - MIN_ITEM_COUNT) / (MAX_ITEM_COUNT - MIN_ITEM_COUNT)) * 100}%`,
                }}
              >
                <input
                  type="range"
                  min={MIN_ITEM_COUNT}
                  max={MAX_ITEM_COUNT}
                  value={minItemCount}
                  onChange={(event) => updateMinItemCount(event.target.value)}
                  aria-label="Minimum generated items"
                />
                <input
                  type="range"
                  min={MIN_ITEM_COUNT}
                  max={MAX_ITEM_COUNT}
                  value={maxItemCount}
                  onChange={(event) => updateMaxItemCount(event.target.value)}
                  aria-label="Maximum generated items"
                />
              </div>
            </div>

            <p className="loot-field-hint">
              Generate between {formatItemCountRange(minItemCount, maxItemCount)}.
            </p>
          </fieldset>

          <fieldset className="loot-fieldset loot-settings-panel">
            <legend>Item rarity</legend>
            <div className="loot-setting-list">
              {rarityRows.map((setting) => (
                <LootSettingRow key={setting.id} {...setting} />
              ))}
            </div>
            <p className="loot-field-hint">
              Rarity values are relative weights. A 50 weight item is half as likely as a 100 weight item.
            </p>
          </fieldset>

          <div className="loot-actions">
            <button type="button" className="primary-action" onClick={generateLoot} disabled={isGeneratingLoot}>
              <MdAutoAwesome aria-hidden="true" />
              {isGeneratingLoot ? 'Generating...' : 'Generate Loot'}
            </button>
            <button type="button" onClick={resetLoot}>
              <MdRefresh aria-hidden="true" />
              Reset
            </button>
          </div>
        </form>

        <section className="loot-results" aria-label="Loot generator preview">
          <fieldset className="loot-fieldset loot-settings-panel loot-category-settings">
            <legend>Item categories</legend>
            <div className="loot-preset-panel">
              <label className="loot-preset-field" htmlFor="loot-category-preset">
                <span>Preset</span>
                <select
                  id="loot-category-preset"
                  value={selectedPresetId}
                  onChange={(event) => applyPresetById(event.target.value)}
                >
                  <option value="custom-current">Current weights</option>
                  <optgroup label="Built-in locations">
                    {BUILT_IN_PRESET_DEFINITIONS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </optgroup>
                  {customPresets.length > 0 && (
                    <optgroup label="Custom presets">
                      {customPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </label>

              <label className="loot-preset-field" htmlFor="loot-custom-preset-name">
                <span>Custom name</span>
                <input
                  id="loot-custom-preset-name"
                  type="text"
                  value={customPresetName}
                  onChange={(event) => setCustomPresetName(event.target.value)}
                  placeholder="e.g. Frost Giant Hold"
                />
              </label>

              <div className="loot-preset-actions" aria-label="Custom preset actions">
                <button type="button" onClick={createCustomPreset} disabled={!customPresetName.trim()}>
                  <MdSave aria-hidden="true" />
                  Save New
                </button>
                <button
                  type="button"
                  onClick={savePresetEdits}
                  disabled={!selectedBuiltInPreset && !selectedCustomPreset}
                >
                  <MdSave aria-hidden="true" />
                  {selectedBuiltInPreset ? 'Save Copy' : 'Update'}
                </button>
                <button type="button" onClick={deleteCustomPreset} disabled={!selectedCustomPreset}>
                  <MdDelete aria-hidden="true" />
                  Delete
                </button>
              </div>
            </div>
            <div className="loot-setting-list">
              {categoryRows.map((setting) => (
                <LootSettingRow key={setting.id} {...setting} />
              ))}
            </div>
            <p className="loot-field-hint">
              Category weights are relative to other enabled categories. Subcategories can narrow a parent category.
            </p>
          </fieldset>

          <div className="loot-summary-grid">
            <article className="loot-summary-card">
              <span>Target Level</span>
              <strong>{formatLevel(targetLevel)}</strong>
            </article>
            <article className="loot-summary-card">
              <span>Item Levels</span>
              <strong>{formatLevelRange(levelRange)}</strong>
            </article>
            <article className="loot-summary-card">
              <span>Budget</span>
              <strong>{gpBudget.toLocaleString()} gp</strong>
            </article>
            <article className="loot-summary-card">
              <span>Generated</span>
              <strong>{lootDraft ? formatGp(generatedTotalValue) : '-'}</strong>
            </article>
            <article className="loot-summary-card">
              <span>Items</span>
              <strong>{formatItemCountRange(minItemCount, maxItemCount)}</strong>
            </article>
            <article className="loot-summary-card">
              <span>Rarities</span>
              <strong>{enabledRarityCount}</strong>
            </article>
            <article className="loot-summary-card">
              <span>Categories</span>
              <strong>
                {enabledCategoryCount}/{CATEGORY_OPTIONS.length}
              </strong>
            </article>
          </div>

          <div className="loot-planning-panel">
            {lootDraft ? (
              <div className="loot-generated-panel">
                <div className="loot-generated-heading">
                  <div>
                    <p className="loot-panel-kicker">Generated loot</p>
                    <h2>{formatGp(generatedTotalValue)}</h2>
                  </div>
                  <span>
                    Target {formatGp(gpBudget)} · {Math.round(lootDraft.differenceRatio * 100)}% off
                  </span>
                </div>
                {lootStatus && <p className="loot-generation-status">{lootStatus}</p>}
                <div className="loot-generated-list">
                  {lootDraft.items.map((item) => (
                    <article key={item.slug} className="loot-generated-item">
                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {formatGeneratedItemLevel(item)} · {labelFromId(item.rarity)} · {labelFromId(item.type)}
                        </p>
                        <p>{(item.lootCategories ?? []).map(labelFromId).join(', ') || 'Uncategorized'}</p>
                      </div>
                      <strong>{formatGp(item.priceGp)}</strong>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="loot-panel-kicker">Next step</p>
                <h2>Item selection will use this setup.</h2>
                <p>
                  The generator can now look for items from {formatLevelRange(levelRange).toLowerCase()}{' '}
                  and keep {formatItemCountRange(minItemCount, maxItemCount)} close to{' '}
                  {gpBudget.toLocaleString()} gp.
                </p>
                {(lootStatus || lootError) && (
                  <p className={`loot-generation-status ${lootError ? 'is-error' : ''}`}>
                    {lootError || lootStatus}
                  </p>
                )}
                <div className="loot-rarity-preview" aria-label="Enabled rarity weights">
                  {RARITY_OPTIONS.map((rarity) => {
                    const setting = raritySettings[rarity.id]

                    return (
                      <span key={rarity.id} className={setting.enabled ? '' : 'is-disabled'}>
                        {rarity.label}: {setting.enabled ? setting.weight : 'disabled'}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  )
}
