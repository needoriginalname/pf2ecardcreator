import { useMemo, useState } from 'react'
import { MdArrowBack, MdAutoAwesome, MdRefresh } from 'react-icons/md'

const PARTY_SIZE_OPTIONS = [1, 2, 3, 4, 5, 6]
const LEVEL_OPTIONS = Array.from({ length: 26 }, (_, index) => index - 1)
const LOOT_TEMPLATES = {
  balanced: ['Coins and valuables', 'Consumable item', 'Permanent item'],
  coins: ['Coins', 'Trade goods', 'Art object'],
  items: ['Permanent item', 'Consumable item', 'Formula or scroll'],
}

const formatLevel = (level) => (level === -1 ? '0 or lower' : String(level))

const getTreasureBudget = (level, partySize) => {
  const baseValue = Math.max(1, level + 2) * 18
  return Math.round(baseValue * (partySize / 4))
}

const createLootDraft = (budget, rewardStyle) => {
  const templates = LOOT_TEMPLATES[rewardStyle] ?? LOOT_TEMPLATES.balanced
  const weights =
    rewardStyle === 'coins'
      ? [0.62, 0.25, 0.13]
      : rewardStyle === 'items'
        ? [0.54, 0.28, 0.18]
        : [0.4, 0.32, 0.28]

  return templates.map((label, index) => ({
    id: `${label}-${index}`,
    label,
    value: Math.max(1, Math.round(budget * weights[index])),
  }))
}

export default function LootGenerator({ onBackHome }) {
  const [partySize, setPartySize] = useState(4)
  const [encounterLevel, setEncounterLevel] = useState(1)
  const [rewardStyle, setRewardStyle] = useState('balanced')
  const [lootDraft, setLootDraft] = useState([])

  const estimatedBudget = useMemo(
    () => getTreasureBudget(encounterLevel, partySize),
    [encounterLevel, partySize]
  )

  const generateLoot = () => {
    setLootDraft(createLootDraft(estimatedBudget, rewardStyle))
  }

  const resetLoot = () => {
    setPartySize(4)
    setEncounterLevel(1)
    setRewardStyle('balanced')
    setLootDraft([])
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
          <p>Draft encounter rewards and treasure parcels.</p>
        </div>
      </header>

      <section className="loot-workspace" aria-label="Loot generator workspace">
        <form className="loot-controls">
          <div className="loot-field">
            <label htmlFor="loot-level">Encounter level</label>
            <select
              id="loot-level"
              value={encounterLevel}
              onChange={(event) => setEncounterLevel(Number(event.target.value))}
            >
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {formatLevel(level)}
                </option>
              ))}
            </select>
          </div>

          <div className="loot-field">
            <label htmlFor="loot-party-size">Party size</label>
            <select
              id="loot-party-size"
              value={partySize}
              onChange={(event) => setPartySize(Number(event.target.value))}
            >
              {PARTY_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="loot-fieldset">
            <legend>Reward style</legend>
            <div className="segmented-control">
              {[
                ['balanced', 'Balanced'],
                ['coins', 'Coin-heavy'],
                ['items', 'Item-heavy'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={rewardStyle === value ? 'active' : ''}
                  onClick={() => setRewardStyle(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="loot-actions">
            <button type="button" className="primary-action" onClick={generateLoot}>
              <MdAutoAwesome aria-hidden="true" />
              Generate Loot
            </button>
            <button type="button" onClick={resetLoot}>
              <MdRefresh aria-hidden="true" />
              Reset
            </button>
          </div>
        </form>

        <section className="loot-results" aria-label="Generated loot">
          <div className="loot-summary">
            <span>Estimated Budget</span>
            <strong>{estimatedBudget} gp</strong>
          </div>

          {lootDraft.length > 0 ? (
            <div className="loot-list">
              {lootDraft.map((entry) => (
                <article key={entry.id} className="loot-entry">
                  <span>{entry.label}</span>
                  <strong>{entry.value} gp</strong>
                </article>
              ))}
            </div>
          ) : (
            <div className="loot-empty-state">
              <h2>Loot Table</h2>
              <p>Generated rewards will land here.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
