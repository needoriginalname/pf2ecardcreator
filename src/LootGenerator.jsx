import { useMemo, useState } from 'react'
import { MdArrowBack, MdAutoAwesome, MdExpandMore, MdRefresh, MdTune } from 'react-icons/md'

const LEVEL_OPTIONS = Array.from({ length: 26 }, (_, index) => index - 1)
const LEVEL_SPREAD_OPTIONS = [0, 1, 2, 3, 4]
const DEFAULT_TARGET_LEVEL = 1
const DEFAULT_LEVEL_SPREAD = 1
const DEFAULT_GP_BUDGET = 100
const MIN_GP_BUDGET = 1
const MAX_GP_BUDGET = 100000
const RARITY_OPTIONS = [
  { id: 'common', label: 'Common', enabled: true, weight: 100 },
  { id: 'uncommon', label: 'Uncommon', enabled: true, weight: 40 },
  { id: 'rare', label: 'Rare', enabled: true, weight: 5 },
  { id: 'unique', label: 'Unique', enabled: false, weight: 0 },
]
const CATEGORY_OPTIONS = [
  {
    id: 'alchemical-items',
    label: 'Alchemical Items',
    subsettings: [
      { id: 'alchemical-ammunition', label: 'Alchemical Ammunition' },
      { id: 'alchemical-bombs', label: 'Alchemical Bombs' },
      { id: 'alchemical-elixirs', label: 'Alchemical Elixirs' },
      { id: 'alchemical-food', label: 'Alchemical Food' },
      { id: 'alchemical-plants', label: 'Alchemical Plants' },
      { id: 'alchemical-poisons', label: 'Alchemical Poisons' },
      { id: 'alchemical-tools', label: 'Alchemical Tools' },
      { id: 'bottled-monstrosities', label: 'Bottled Monstrosities' },
      { id: 'drugs', label: 'Drugs' },
    ],
  },
  { id: 'apex-items', label: 'Apex Items' },
  {
    id: 'armor',
    label: 'Armor',
    subsettings: [
      { id: 'base-armor', label: 'Base Armor' },
      { id: 'basic-magic-armor', label: 'Basic Magic Armor' },
      { id: 'precious-material-armor', label: 'Precious Material Armor' },
      { id: 'specific-magic-armor', label: 'Specific Magic Armor' },
    ],
  },
  { id: 'banners', label: 'Banners' },
  { id: 'censer', label: 'Censer' },
  {
    id: 'consumables',
    label: 'Consumables',
    subsettings: [
      { id: 'bottled-breath', label: 'Bottled Breath' },
      { id: 'fulu', label: 'Fulu' },
      { id: 'gadgets', label: 'Gadgets' },
      { id: 'magical-ammunition', label: 'Magical Ammunition' },
      { id: 'magical-siege-ammunition', label: 'Magical Siege Ammunition' },
      { id: 'missive', label: 'Missive' },
      { id: 'oils', label: 'Oils' },
      { id: 'potions', label: 'Potions' },
      { id: 'scrolls', label: 'Scrolls' },
      { id: 'spell-catalysts', label: 'Spell Catalysts' },
      { id: 'talismans', label: 'Talismans' },
      { id: 'tea', label: 'Tea' },
      { id: 'whetstones', label: 'Whetstones' },
      { id: 'other-consumables', label: 'Other Consumables' },
    ],
  },
  { id: 'cursed-items', label: 'Cursed Items' },
  { id: 'grimoire', label: 'Grimoire' },
  { id: 'held-items', label: 'Held Items' },
  { id: 'high-tech-items', label: 'High-tech Items' },
  { id: 'intelligent-items', label: 'Intelligent Items' },
  { id: 'materials', label: 'Materials' },
  {
    id: 'runes',
    label: 'Runes',
    subsettings: [
      { id: 'accessory-runes', label: 'Accessory Runes' },
      { id: 'armor-property-runes', label: 'Armor Property Runes' },
      { id: 'fundamental-armor-runes', label: 'Fundamental Armor Runes' },
      { id: 'fundamental-weapon-runes', label: 'Fundamental Weapon Runes' },
      { id: 'shield-runes', label: 'Shield Runes' },
      { id: 'weapon-property-runes', label: 'Weapon Property Runes' },
    ],
  },
  {
    id: 'shields',
    label: 'Shields',
    subsettings: [
      { id: 'base-shields', label: 'Base Shields' },
      { id: 'precious-material-shields', label: 'Precious Material Shields' },
      { id: 'specific-shields', label: 'Specific Shields' },
    ],
  },
  { id: 'snares', label: 'Snares' },
  { id: 'spellhearts', label: 'Spellhearts' },
  { id: 'staves', label: 'Staves' },
  { id: 'trade-goods', label: 'Trade Goods' },
  {
    id: 'wands',
    label: 'Wands',
    subsettings: [
      { id: 'base-magic-wands', label: 'Base Magic Wands' },
      { id: 'speciality-wands', label: 'Speciality Wands' },
    ],
  },
  {
    id: 'weapons',
    label: 'Weapons',
    subsettings: [
      { id: 'base-weapons', label: 'Base Weapons' },
      { id: 'base-magical-weapons', label: 'Base Magical Weapons' },
      { id: 'beast-guns', label: 'Beast Guns' },
      { id: 'precious-material-weapons', label: 'Precious Material Weapons' },
      { id: 'specific-magic-weapons', label: 'Specific Magic Weapons' },
    ],
  },
  {
    id: 'worn-items',
    label: 'Worn Items',
    subsettings: [
      { id: 'companion-items', label: 'Companion Items' },
      { id: 'eidolon-items', label: 'Eidolon Items' },
      { id: 'other-worn-items', label: 'Other Worn Items' },
    ],
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
  const [raritySettings, setRaritySettings] = useState(() => getDefaultSettings(RARITY_OPTIONS))
  const [categorySettings, setCategorySettings] = useState(() => getDefaultSettings(CATEGORY_OPTIONS))

  const levelRange = useMemo(() => getLevelRange(targetLevel, levelSpread), [targetLevel, levelSpread])
  const enabledRarityCount = useMemo(() => countEnabledSettings(raritySettings), [raritySettings])
  const enabledCategoryCount = useMemo(() => countEnabledSettings(categorySettings), [categorySettings])
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

  const resetLoot = () => {
    setTargetLevel(DEFAULT_TARGET_LEVEL)
    setLevelSpread(DEFAULT_LEVEL_SPREAD)
    setGpBudget(DEFAULT_GP_BUDGET)
    setRaritySettings(getDefaultSettings(RARITY_OPTIONS))
    setCategorySettings(getDefaultSettings(CATEGORY_OPTIONS))
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
            <button type="button" className="primary-action" disabled>
              <MdAutoAwesome aria-hidden="true" />
              Generate Loot
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
            <div>
              <p className="loot-panel-kicker">Next step</p>
              <h2>Item selection will use this setup.</h2>
              <p>
                The generator can now look for items from {formatLevelRange(levelRange).toLowerCase()}{' '}
                and keep the total close to {gpBudget.toLocaleString()} gp.
              </p>
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
          </div>
        </section>
      </section>
    </main>
  )
}
