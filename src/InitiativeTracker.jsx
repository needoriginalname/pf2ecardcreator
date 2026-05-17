import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MdAdd,
  MdAddCircle,
  MdArrowBack,
  MdClose,
  MdDelete,
  MdFileDownload,
  MdFileUpload,
  MdGroups,
  MdHealing,
  MdLocalFireDepartment,
  MdPlayArrow,
  MdPsychology,
  MdRefresh,
  MdRemove,
  MdSave,
  MdShield,
  MdSkipNext,
  MdSkipPrevious,
  MdTune,
  MdVisibilityOff,
  MdAccessibility,
} from 'react-icons/md'

const STORAGE_KEY = 'pf2e-initiative-tracker-v1'
const GROUP_EXPORT_TYPE = 'pf2e-initiative-groups'
const GROUP_EXPORT_VERSION = 1
const LONG_PRESS_MS = 300
const PARTICIPANT_KINDS = [
  { id: 'player', label: 'Player' },
  { id: 'monster', label: 'Monster' },
  { id: 'hazard', label: 'Hazard' },
]
const MODIFIER_TYPES = [
  { id: 'status', label: 'Status' },
  { id: 'item', label: 'Item' },
  { id: 'circumstance', label: 'Circumstance' },
]
const CONDITION_OPTIONS = [
  { key: 'frightened', name: 'Frightened', hasValue: true, defaultValue: 1 },
  { key: 'off-guard', name: 'Off-guard', hasValue: false },
  { key: 'prone', name: 'Prone', hasValue: false },
  { key: 'sickened', name: 'Sickened', hasValue: true, defaultValue: 1 },
  { key: 'slowed', name: 'Slowed', hasValue: true, defaultValue: 1 },
  { key: 'stunned', name: 'Stunned', hasValue: true, defaultValue: 1 },
  { key: 'grabbed', name: 'Grabbed', hasValue: false },
  { key: 'dazzled', name: 'Dazzled', hasValue: false },
  { key: 'clumsy', name: 'Clumsy', hasValue: true, defaultValue: 1 },
  { key: 'enfeebled', name: 'Enfeebled', hasValue: true, defaultValue: 1 },
  { key: 'stupefied', name: 'Stupefied', hasValue: true, defaultValue: 1 },
]
const DAMAGE_DICE_OPTIONS = ['', 'd4', 'd6', 'd8', 'd10', 'd20']
const CUSTOM_DAMAGE_TYPE = 'custom'
const PERSISTENT_DAMAGE_TYPES = [
  'acid',
  'bleed',
  'bludgeoning',
  'cold',
  'electricity',
  'fire',
  'mental',
  'piercing',
  'poison',
  'slashing',
  'spirit',
  'vitality',
  'void',
]
const SKILL_OPTIONS = [
  'Acrobatics',
  'Arcana',
  'Athletics',
  'Crafting',
  'Deception',
  'Diplomacy',
  'Intimidation',
  'Lore',
  'Medicine',
  'Nature',
  'Occultism',
  'Performance',
  'Religion',
  'Society',
  'Stealth',
  'Survival',
  'Thievery',
  'Perception',
]
const MODIFIER_TARGETS = [
  { id: 'attack', label: 'Attacks' },
  { id: 'skill', label: 'Skills' },
  { id: 'fortitude', label: 'Fortitude' },
  { id: 'reflex', label: 'Reflex' },
  { id: 'will', label: 'Will' },
  { id: 'ac', label: 'AC' },
]
const DEFAULT_AUTOMATION = {
  frightened: true,
  persistentDamage: true,
  raisedShield: true,
}
const QUICK_CONDITIONS = {
  frightened: {
    id: 'frightened',
    key: 'frightened',
    name: 'Frightened',
    value: 1,
    locked: false,
  },
  prone: {
    id: 'prone',
    key: 'prone',
    name: 'Prone',
    value: null,
    locked: false,
  },
  offGuard: {
    id: 'off-guard',
    key: 'off-guard',
    name: 'Off-guard',
    value: null,
    locked: false,
  },
}
const RAISED_SHIELD = {
  id: 'raised-shield',
  key: 'raised-shield',
  name: 'Raised Shield',
  target: 'ac',
  type: 'circumstance',
  value: 2,
}
const RADIAL_VIEWBOX_SIZE = 320
const RADIAL_CENTER = RADIAL_VIEWBOX_SIZE / 2
const RADIAL_OUTER_RADIUS = 148
const RADIAL_INNER_RADIUS = 76
const RADIAL_LABEL_RADIUS = 112
const RADIAL_GAP_DEGREES = 3

let idCounter = 0
const createId = (prefix) => `${prefix}-${Date.now()}-${idCounter += 1}`
const clampNumber = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)
const parseInteger = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback
}
const formatSigned = (value) => `${value > 0 ? '+' : ''}${value}`
const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'custom'
const createDownloadName = (name, fallback) => `${slugify(name || fallback)}.json`

const getKindLabel = (kind) => PARTICIPANT_KINDS.find((option) => option.id === kind)?.label ?? 'Combatant'
const getParticipantName = (participant) => participant.name.trim() || getKindLabel(participant.kind)
const getConditionLabel = (condition) =>
  condition.value === null || condition.value === undefined
    ? condition.name
    : `${condition.name} ${condition.value}${condition.locked ? ` locked at ${condition.floor ?? 1}` : ''}`

const getConditionOption = (key) =>
  CONDITION_OPTIONS.find((condition) => condition.key === key) ?? CONDITION_OPTIONS[0]

const getConditionValueForOption = (conditionKey, value) => {
  const option = getConditionOption(conditionKey)
  if (!option.hasValue) return null
  return Math.max(0, parseInteger(value, option.defaultValue ?? 1))
}

const createConditionDefinition = (conditionKey, value, locked = false, floor = 1) => {
  const option = getConditionOption(conditionKey)
  const lockFloor = Math.max(0, parseInteger(floor, 1))
  const conditionValue = getConditionValueForOption(option.key, value)

  return {
    key: option.key,
    name: option.name,
    value:
      option.key === 'frightened' && locked && conditionValue !== null
        ? Math.max(conditionValue, lockFloor)
        : conditionValue,
    locked: option.key === 'frightened' && locked,
    floor: option.key === 'frightened' && locked ? lockFloor : 0,
  }
}

const getModifierTargetLabel = (modifier) => {
  if (modifier.target === 'skill' && modifier.targetDetail) return modifier.targetDetail
  return MODIFIER_TARGETS.find((target) => target.id === modifier.target)?.label ?? 'Modifier'
}

const getModifierName = ({ name, target, targetDetail }) => {
  const trimmedName = String(name || '').trim()
  if (trimmedName) return trimmedName
  if (target === 'skill') return targetDetail || SKILL_OPTIONS[0]
  return MODIFIER_TARGETS.find((option) => option.id === target)?.label ?? 'Modifier'
}

const getModifierLabel = (modifier) => {
  const scope = getModifierTargetLabel(modifier)
  const scopeSuffix = modifier.name && modifier.name !== scope ? ` (${scope})` : ''
  return `${modifier.name}${scopeSuffix} ${formatSigned(modifier.value)} ${modifier.type}`
}

const parsePersistentDice = (dice) => {
  const value = String(dice || '').trim()
  const diceMatch = value.match(/^(\d*)d(4|6|8|10|20)$/i)
  if (diceMatch) {
    return {
      damageAmount: Math.max(1, parseInteger(diceMatch[1] || '1', 1)),
      damageDie: `d${diceMatch[2]}`,
    }
  }

  const fixed = parseInteger(value, 1)
  return {
    damageAmount: Math.max(1, fixed),
    damageDie: '',
  }
}

const getPersistentDamageLabel = (damage) =>
  `${damage.damageAmount}${damage.damageDie ? damage.damageDie : ''} ${damage.damageType} DC ${damage.dc}`

const getSelectedPersistentDamageType = (type, customType) =>
  type === CUSTOM_DAMAGE_TYPE ? customType.trim() || 'custom' : type

const getRadialPoint = (angleDegrees, radius) => {
  const radians = ((angleDegrees - 90) * Math.PI) / 180

  return {
    x: RADIAL_CENTER + radius * Math.cos(radians),
    y: RADIAL_CENTER + radius * Math.sin(radians),
  }
}

const getRadialSegmentPath = (startAngle, endAngle) => {
  const outerStart = getRadialPoint(startAngle, RADIAL_OUTER_RADIUS)
  const outerEnd = getRadialPoint(endAngle, RADIAL_OUTER_RADIUS)
  const innerEnd = getRadialPoint(endAngle, RADIAL_INNER_RADIUS)
  const innerStart = getRadialPoint(startAngle, RADIAL_INNER_RADIUS)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${RADIAL_OUTER_RADIUS} ${RADIAL_OUTER_RADIUS} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${RADIAL_INNER_RADIUS} ${RADIAL_INNER_RADIUS} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

const splitRadialLabel = (label) => {
  const words = label.split(' ')
  if (words.length <= 1) return [label]
  if (words.length === 2) return words

  return [words.slice(0, -1).join(' '), words.at(-1)]
}

const getRandomInt = (minimum, maximum) => {
  const range = maximum - minimum + 1
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const roll = new Uint32Array(1)
    window.crypto.getRandomValues(roll)
    return minimum + (roll[0] % range)
  }

  return minimum
}

const rollD20 = () => getRandomInt(1, 20)

const rollPersistentDamage = (damage) => {
  const amount = Math.max(0, parseInteger(damage.damageAmount, 0))
  if (!damage.damageDie) {
    return {
      total: amount,
      detail: String(amount),
    }
  }

  const count = Math.max(1, amount)
  const sides = Math.max(1, parseInteger(String(damage.damageDie).replace('d', ''), 6))
  const rolls = Array.from({ length: count }, () => getRandomInt(1, sides))
  const total = Math.max(0, rolls.reduce((sum, roll) => sum + roll, 0))

  return {
    total,
    detail: rolls.join('+'),
  }
}

const createParticipant = (kind = 'monster') => ({
  id: createId(kind),
  name: '',
  kind,
  initiative: 0,
  initiativeModifier: 0,
  tieBreak: 0,
  hpTracking: kind !== 'player',
  currentHp: kind === 'player' ? 0 : 20,
  maxHp: kind === 'player' ? 0 : 20,
  tempHp: 0,
  ac: '',
  notes: '',
  conditions: [],
  modifiers: [],
  persistentDamage: [],
})

const createCondition = (definition) => ({
  id: createId('condition'),
  key: definition.key ?? definition.conditionId ?? definition.id ?? slugify(definition.name),
  name: definition.name,
  value: definition.value ?? null,
  locked: Boolean(definition.locked),
  floor: Math.max(0, parseInteger(definition.floor, definition.locked ? 1 : 0)),
})

const createModifier = (definition) => ({
  id: createId('modifier'),
  key: definition.key ?? definition.id ?? slugify(`${definition.name || definition.target}-${definition.targetDetail || ''}`),
  name: getModifierName(definition),
  target: definition.target ?? 'attack',
  targetDetail: definition.target === 'skill' ? definition.targetDetail ?? SKILL_OPTIONS[0] : '',
  type: definition.type ?? 'status',
  value: parseInteger(definition.value, 1),
})

const createPersistentDamage = (definition = {}) => {
  const parsedDice = parsePersistentDice(definition.dice ?? '1d6')

  return {
    id: createId('persistent'),
    damageAmount: Math.max(0, parseInteger(definition.damageAmount, parsedDice.damageAmount)),
    damageDie: definition.damageDie ?? parsedDice.damageDie,
    damageType: definition.damageType || 'fire',
    dc: Math.max(1, parseInteger(definition.dc, 15)),
    lastResult: definition.lastResult || '',
  }
}

const normalizeCondition = (condition) => ({
  id: condition?.id ?? createId('condition'),
  key: condition?.key ?? condition?.conditionId ?? slugify(condition?.name),
  name: condition?.name ?? 'Condition',
  value: condition?.value === undefined ? null : condition.value,
  locked: Boolean(condition?.locked || (condition?.key === 'frightened' && condition?.floor > 0)),
  floor: Math.max(0, parseInteger(condition?.floor, condition?.locked ? 1 : 0)),
})

const normalizeModifier = (modifier) => {
  const target = modifier?.target === 'save' ? 'will' : modifier?.target === 'dc' ? 'attack' : modifier?.target ?? 'attack'
  const targetDetail = target === 'skill' ? modifier?.targetDetail ?? SKILL_OPTIONS[0] : ''
  const name = getModifierName({
    name: modifier?.name,
    target,
    targetDetail,
  })
  const key = modifier?.key ?? modifier?.id ?? slugify(`${name}-${target}-${targetDetail}`)

  return {
    id: modifier?.id ?? createId('modifier'),
    key,
    name,
    target: key === RAISED_SHIELD.key ? 'ac' : target,
    targetDetail,
    type: modifier?.type ?? 'status',
    value: parseInteger(modifier?.value, 1),
  }
}

const normalizePersistentDamage = (damage) => {
  const parsedDice = parsePersistentDice(damage?.dice ?? '1d6')

  return {
    id: damage?.id ?? createId('persistent'),
    damageAmount: Math.max(0, parseInteger(damage?.damageAmount, parsedDice.damageAmount)),
    damageDie: damage?.damageDie ?? parsedDice.damageDie,
    damageType: damage?.damageType ?? damage?.type ?? 'fire',
    dc: Math.max(1, parseInteger(damage?.dc, 15)),
    lastResult: damage?.lastResult ?? damage?.lastCheck ?? '',
  }
}

const normalizeParticipant = (participant) => ({
  ...createParticipant(participant?.kind ?? 'monster'),
  ...participant,
  id: participant?.id ?? createId(participant?.kind ?? 'combatant'),
  name: String(participant?.name ?? ''),
  kind: PARTICIPANT_KINDS.some((option) => option.id === participant?.kind) ? participant.kind : 'monster',
  initiative: parseInteger(participant?.initiative, 0),
  initiativeModifier: parseInteger(
    participant?.initiativeModifier,
    participant?.kind === 'player' ? 0 : participant?.initiative,
  ),
  tieBreak: parseInteger(participant?.tieBreak, 0),
  currentHp: parseInteger(participant?.currentHp, 0),
  maxHp: Math.max(0, parseInteger(participant?.maxHp, 0)),
  tempHp: Math.max(0, parseInteger(participant?.tempHp, 0)),
  hpTracking: Boolean(participant?.hpTracking),
  ac: String(participant?.ac ?? ''),
  notes: String(participant?.notes ?? ''),
  conditions: Array.isArray(participant?.conditions) ? participant.conditions.map(normalizeCondition) : [],
  modifiers: Array.isArray(participant?.modifiers) ? participant.modifiers.map(normalizeModifier) : [],
  persistentDamage: Array.isArray(participant?.persistentDamage)
    ? participant.persistentDamage.map(normalizePersistentDamage)
    : [],
})

const normalizeGroupMemberForSave = (participant) => {
  const normalized = normalizeParticipant(participant)

  return {
    ...normalized,
    id: undefined,
    initiative: 0,
    initiativeModifier: normalized.initiativeModifier ?? 0,
  }
}

const normalizeImportedGroup = (group) => {
  const members = Array.isArray(group?.members)
    ? group.members.map(normalizeGroupMemberForSave)
    : []

  if (members.length === 0) return null

  return {
    id: createId('group'),
    name: String(group?.name || 'Imported Group'),
    members,
  }
}

const getGroupsFromImportPayload = (payload) => {
  const sourceGroups = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.groups)
      ? payload.groups
      : payload?.name && Array.isArray(payload?.members)
        ? [payload]
        : []

  return sourceGroups.map(normalizeImportedGroup).filter(Boolean)
}

const createGroupExportPayload = (groups) => ({
  type: GROUP_EXPORT_TYPE,
  version: GROUP_EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  groups: groups.map((group) => ({
    name: group.name,
    members: group.members.map(normalizeGroupMemberForSave),
  })),
})

const downloadJsonFile = (filename, payload) => {
  if (typeof document === 'undefined') return

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const getInitialState = () => {
  const fallback = {
    participants: [],
    groups: [],
    mode: 'edit',
    activeId: '',
    round: 1,
    automation: DEFAULT_AUTOMATION,
    combatLog: [],
  }

  if (typeof window === 'undefined') return fallback

  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')

    return {
      participants: Array.isArray(saved.participants) ? saved.participants.map(normalizeParticipant) : [],
      groups: Array.isArray(saved.groups) ? saved.groups : [],
      mode: saved.mode === 'initiative' ? 'initiative' : 'edit',
      activeId: saved.activeId ?? '',
      round: Math.max(1, parseInteger(saved.round, 1)),
      automation: {
        ...DEFAULT_AUTOMATION,
        ...(saved.automation ?? {}),
      },
      combatLog: Array.isArray(saved.combatLog) ? saved.combatLog.slice(0, 8) : [],
    }
  } catch {
    return fallback
  }
}

const sortParticipants = (participants) =>
  [...participants].sort((first, second) => {
    if (second.initiative !== first.initiative) return second.initiative - first.initiative
    if (second.tieBreak !== first.tieBreak) return second.tieBreak - first.tieBreak
    return getParticipantName(first).localeCompare(getParticipantName(second))
  })

const rollInitiativeForParticipant = (participant) => {
  if (participant.kind === 'player') {
    return {
      participant,
      logEntry: '',
    }
  }

  const roll = rollD20()
  const modifier = parseInteger(participant.initiativeModifier, 0)
  const total = roll + modifier

  return {
    participant: {
      ...participant,
      initiative: total,
    },
    logEntry: `${getParticipantName(participant)} initiative: ${roll} ${formatSigned(modifier)} = ${total}.`,
  }
}

const applyHpDeltaToParticipant = (participant, amount) => {
  if (!participant.hpTracking) return participant

  if (amount >= 0) {
    const healed = participant.maxHp > 0
      ? Math.min(participant.maxHp, participant.currentHp + amount)
      : participant.currentHp + amount

    return {
      ...participant,
      currentHp: healed,
    }
  }

  const damage = Math.abs(amount)
  const nextTempHp = Math.max(0, participant.tempHp - damage)
  const remainingDamage = Math.max(0, damage - participant.tempHp)

  return {
    ...participant,
    tempHp: nextTempHp,
    currentHp: Math.max(0, participant.currentHp - remainingDamage),
  }
}

const processEndOfTurnAutomation = (participant, automation) => {
  let nextParticipant = participant
  const logEntries = []

  if (automation.frightened) {
    nextParticipant = {
      ...nextParticipant,
      conditions: nextParticipant.conditions
        .map((condition) => {
          if (condition.key !== 'frightened' || condition.value === null || condition.value === undefined) {
            return condition
          }

          const floor = condition.locked ? Math.max(0, parseInteger(condition.floor, 1)) : 0
          const nextValue = Math.max(floor, condition.value - 1)

          if (nextValue !== condition.value) {
            logEntries.push(`${getParticipantName(participant)} frightened decreases to ${nextValue}.`)
          }

          return {
            ...condition,
            value: nextValue,
          }
        })
        .filter((condition) => condition.key !== 'frightened' || condition.value > 0 || condition.locked),
    }
  }

  if (automation.persistentDamage && nextParticipant.persistentDamage.length > 0) {
    let damageAdjustedParticipant = nextParticipant
    const remainingPersistentDamage = []

    nextParticipant.persistentDamage.forEach((damage) => {
      const damageRoll = rollPersistentDamage(damage)
      const recoveryRoll = rollD20()
      const succeeded = recoveryRoll >= damage.dc
      const damageText = `${damageRoll.total} ${damage.damageType}`

      damageAdjustedParticipant = applyHpDeltaToParticipant(damageAdjustedParticipant, -damageRoll.total)
      logEntries.push(
        `${getParticipantName(participant)} takes ${damageText} persistent damage; recovery ${recoveryRoll} vs DC ${damage.dc}${succeeded ? ' succeeds.' : ' fails.'}`,
      )

      if (!succeeded) {
        remainingPersistentDamage.push({
          ...damage,
          lastResult: `${damageText}; recovery ${recoveryRoll}/${damage.dc}`,
        })
      }
    })

    nextParticipant = {
      ...damageAdjustedParticipant,
      persistentDamage: remainingPersistentDamage,
    }
  }

  return {
    participant: nextParticipant,
    logEntries,
  }
}

const processStartOfTurnAutomation = (participant, automation) => {
  if (!automation.raisedShield) {
    return {
      participant,
      logEntries: [],
    }
  }

  const hasRaisedShield = participant.modifiers.some((modifier) => modifier.key === RAISED_SHIELD.key)
  if (!hasRaisedShield) {
    return {
      participant,
      logEntries: [],
    }
  }

  return {
    participant: {
      ...participant,
      modifiers: participant.modifiers.filter((modifier) => modifier.key !== RAISED_SHIELD.key),
    },
    logEntries: [`${getParticipantName(participant)}'s raised shield ends.`],
  }
}

function ModeSwitch({ mode, onModeChange, disabled }) {
  return (
    <div className="initiative-mode-switch" aria-label="Tracker mode">
      <button
        type="button"
        className={mode === 'edit' ? 'active' : ''}
        onClick={() => onModeChange('edit')}
      >
        <MdTune aria-hidden="true" />
        Edit
      </button>
      <button
        type="button"
        className={mode === 'initiative' ? 'active' : ''}
        onClick={() => onModeChange('initiative')}
        disabled={disabled}
      >
        <MdPlayArrow aria-hidden="true" />
        Play
      </button>
    </div>
  )
}

function ConditionPills({ conditions, onRemove }) {
  if (conditions.length === 0) return <span className="tracker-empty-text">No conditions</span>

  return (
    <div className="tracker-pill-list">
      {conditions.map((condition) => (
        <span
          key={condition.id}
          className={`tracker-pill condition-${condition.key} ${onRemove ? 'is-removable' : ''}`}
          onDoubleClick={(event) => {
            if (!onRemove) return
            event.stopPropagation()
            onRemove(condition.id)
          }}
          onPointerDown={(event) => {
            if (onRemove) event.stopPropagation()
          }}
          title={onRemove ? 'Double-click to remove' : undefined}
        >
          {getConditionLabel(condition)}
          {onRemove && (
            <button type="button" onClick={() => onRemove(condition.id)} aria-label={`Remove ${condition.name}`}>
              <MdClose aria-hidden="true" />
            </button>
          )}
        </span>
      ))}
    </div>
  )
}

function ModifierPills({ modifiers, onRemove }) {
  if (modifiers.length === 0) return <span className="tracker-empty-text">No modifiers</span>

  return (
    <div className="tracker-modifier-groups">
      {MODIFIER_TARGETS.map((target) => {
        const matchingModifiers = modifiers.filter((modifier) => modifier.target === target.id)
        if (matchingModifiers.length === 0) return null

        return (
          <div key={target.id} className="tracker-modifier-group">
            <span>{target.label}</span>
            <div className="tracker-pill-list">
              {matchingModifiers.map((modifier) => (
                <span
                  key={modifier.id}
                  className={`tracker-pill ${modifier.value >= 0 ? 'is-bonus' : 'is-penalty'} ${onRemove ? 'is-removable' : ''}`}
                  onDoubleClick={(event) => {
                    if (!onRemove) return
                    event.stopPropagation()
                    onRemove(modifier.id)
                  }}
                  onPointerDown={(event) => {
                    if (onRemove) event.stopPropagation()
                  }}
                  title={onRemove ? 'Double-click to remove' : undefined}
                >
                  {getModifierLabel(modifier)}
                  {onRemove && (
                    <button type="button" onClick={() => onRemove(modifier.id)} aria-label={`Remove ${modifier.name}`}>
                      <MdClose aria-hidden="true" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PersistentDamagePills({ persistentDamage, onRemove }) {
  if (persistentDamage.length === 0) return <span className="tracker-empty-text">No persistent damage</span>

  return (
    <div className="tracker-pill-list">
      {persistentDamage.map((damage) => (
        <span
          key={damage.id}
          className={`tracker-pill is-persistent ${onRemove ? 'is-removable' : ''}`}
          onDoubleClick={(event) => {
            if (!onRemove) return
            event.stopPropagation()
            onRemove(damage.id)
          }}
          onPointerDown={(event) => {
            if (onRemove) event.stopPropagation()
          }}
          title={onRemove ? 'Double-click to remove' : undefined}
        >
          {getPersistentDamageLabel(damage)}
          {onRemove && (
            <button type="button" onClick={() => onRemove(damage.id)} aria-label="Remove persistent damage">
              <MdClose aria-hidden="true" />
            </button>
          )}
        </span>
      ))}
    </div>
  )
}

function HpMeter({ participant }) {
  if (!participant.hpTracking) return <span className="tracker-empty-text">HP hidden</span>

  const maxHp = Math.max(0, participant.maxHp)
  const hpPercent = maxHp > 0 ? clampNumber((participant.currentHp / maxHp) * 100, 0, 100) : 0
  const hpState = hpPercent <= 25 ? 'is-critical' : hpPercent <= 50 ? 'is-wounded' : 'is-steady'

  return (
    <div className={`tracker-hp-meter ${hpState}`}>
      <div className="tracker-hp-bar" aria-hidden="true">
        <span style={{ width: `${hpPercent}%` }} />
      </div>
      <strong>
        {participant.currentHp}/{participant.maxHp}
        {participant.tempHp > 0 ? ` +${participant.tempHp}` : ''}
      </strong>
    </div>
  )
}

function EditParticipantCard({
  participant,
  onUpdate,
  onRemove,
  onDuplicate,
  onAddCondition,
  onRemoveCondition,
  onAddModifier,
  onRemoveModifier,
  onAddPersistentDamage,
  onRemovePersistentDamage,
}) {
  const [conditionKey, setConditionKey] = useState('frightened')
  const [conditionValue, setConditionValue] = useState('1')
  const [conditionLocked, setConditionLocked] = useState(false)
  const [conditionLockFloor, setConditionLockFloor] = useState(1)
  const [modifierName, setModifierName] = useState('')
  const [modifierTarget, setModifierTarget] = useState('attack')
  const [modifierSkill, setModifierSkill] = useState(SKILL_OPTIONS[0])
  const [modifierType, setModifierType] = useState('status')
  const [modifierValue, setModifierValue] = useState(1)
  const [persistentAmount, setPersistentAmount] = useState(1)
  const [persistentDie, setPersistentDie] = useState('d6')
  const [persistentType, setPersistentType] = useState('fire')
  const [persistentCustomType, setPersistentCustomType] = useState('')
  const [persistentDc, setPersistentDc] = useState(15)
  const selectedCondition = getConditionOption(conditionKey)

  const updateConditionKey = (nextConditionKey) => {
    const option = getConditionOption(nextConditionKey)
    setConditionKey(option.key)
    setConditionValue(option.hasValue ? String(option.defaultValue ?? 1) : '')
    setConditionLocked(false)
    setConditionLockFloor(option.key === 'frightened' ? option.defaultValue ?? 1 : 0)
  }

  const submitCondition = () => {
    onAddCondition(createConditionDefinition(conditionKey, conditionValue, conditionLocked, conditionLockFloor))
    updateConditionKey(conditionKey)
    setConditionLocked(false)
    setConditionLockFloor(1)
  }

  const submitModifier = () => {
    onAddModifier({
      key: slugify(`${modifierName || modifierTarget}-${modifierTarget}-${modifierTarget === 'skill' ? modifierSkill : ''}`),
      name: modifierName,
      target: modifierTarget,
      targetDetail: modifierTarget === 'skill' ? modifierSkill : '',
      type: modifierType,
      value: modifierValue,
    })
    setModifierName('')
  }

  const submitPersistentDamage = () => {
    onAddPersistentDamage({
      damageAmount: persistentAmount,
      damageDie: persistentDie,
      damageType: getSelectedPersistentDamageType(persistentType, persistentCustomType),
      dc: persistentDc,
    })
  }

  return (
    <article className={`setup-combatant-card kind-${participant.kind}`}>
      <div className="setup-combatant-main">
        <div className="setup-name-row">
          <label>
            <span>Name</span>
            <input
              type="text"
              value={participant.name}
              onChange={(event) => onUpdate({ name: event.target.value })}
              placeholder={getKindLabel(participant.kind)}
            />
          </label>
          <label>
            <span>Type</span>
            <select value={participant.kind} onChange={(event) => onUpdate({ kind: event.target.value })}>
              {PARTICIPANT_KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="setup-stat-grid">
          <label>
            <span>{participant.kind === 'player' ? 'Initiative' : 'Initiative Mod'}</span>
            <input
              type="number"
              value={participant.kind === 'player' ? participant.initiative : participant.initiativeModifier}
              onChange={(event) =>
                onUpdate(
                  participant.kind === 'player'
                    ? { initiative: parseInteger(event.target.value, 0) }
                    : { initiativeModifier: parseInteger(event.target.value, 0) },
                )
              }
            />
          </label>
          <label>
            <span>Tie</span>
            <input
              type="number"
              value={participant.tieBreak}
              onChange={(event) => onUpdate({ tieBreak: parseInteger(event.target.value, 0) })}
            />
          </label>
          <label>
            <span>AC</span>
            <input
              type="text"
              value={participant.ac}
              onChange={(event) => onUpdate({ ac: event.target.value })}
              placeholder="-"
            />
          </label>
          <label className="tracker-checkbox">
            <input
              type="checkbox"
              checked={participant.hpTracking}
              onChange={(event) => onUpdate({ hpTracking: event.target.checked })}
            />
            <span>Track HP</span>
          </label>
        </div>

        {participant.hpTracking && (
          <div className="setup-hp-grid">
            <label>
              <span>Current HP</span>
              <input
                type="number"
                value={participant.currentHp}
                onChange={(event) => onUpdate({ currentHp: parseInteger(event.target.value, 0) })}
              />
            </label>
            <label>
              <span>Max HP</span>
              <input
                type="number"
                min="0"
                value={participant.maxHp}
                onChange={(event) => onUpdate({ maxHp: Math.max(0, parseInteger(event.target.value, 0)) })}
              />
            </label>
            <label>
              <span>Temp HP</span>
              <input
                type="number"
                min="0"
                value={participant.tempHp}
                onChange={(event) => onUpdate({ tempHp: Math.max(0, parseInteger(event.target.value, 0)) })}
              />
            </label>
          </div>
        )}

        <label className="setup-notes">
          <span>Private Notes</span>
          <textarea
            value={participant.notes}
            onChange={(event) => onUpdate({ notes: event.target.value })}
            placeholder="Weaknesses, saves, DCs, tactics, reminders"
          />
        </label>
      </div>

      <details className="setup-effects">
        <summary>Starting Effects</summary>

        <section>
          <h3>Conditions</h3>
          <ConditionPills conditions={participant.conditions} onRemove={onRemoveCondition} />
          <div className="inline-effect-form condition-form">
            <select
              value={conditionKey}
              onChange={(event) => updateConditionKey(event.target.value)}
              aria-label="Condition"
            >
              {CONDITION_OPTIONS.map((condition) => (
                <option key={condition.key} value={condition.key}>
                  {condition.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={conditionValue}
              onChange={(event) => setConditionValue(event.target.value)}
              placeholder="Value"
              aria-label="Condition value"
              disabled={!selectedCondition.hasValue}
            />
            {conditionKey === 'frightened' && (
              <>
                <label className="tracker-checkbox compact">
                  <input
                    type="checkbox"
                    checked={conditionLocked}
                    onChange={(event) => setConditionLocked(event.target.checked)}
                  />
                  <span>Lock</span>
                </label>
                {conditionLocked && (
                  <input
                    type="number"
                    min="0"
                    value={conditionLockFloor}
                    onChange={(event) => setConditionLockFloor(Math.max(0, parseInteger(event.target.value, 1)))}
                    aria-label="Frightened lock floor"
                  />
                )}
              </>
            )}
            <button type="button" onClick={submitCondition}>
              <MdAdd aria-hidden="true" />
              Add
            </button>
          </div>
        </section>

        <section>
          <h3>Modifiers</h3>
          <ModifierPills modifiers={participant.modifiers} onRemove={onRemoveModifier} />
          <div className="inline-effect-form modifier-form">
            <input
              type="text"
              value={modifierName}
              onChange={(event) => setModifierName(event.target.value)}
              placeholder="Name (optional)"
              aria-label="Modifier name"
            />
            <select value={modifierTarget} onChange={(event) => setModifierTarget(event.target.value)}>
              {MODIFIER_TARGETS.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.label}
                </option>
              ))}
            </select>
            {modifierTarget === 'skill' && (
              <select value={modifierSkill} onChange={(event) => setModifierSkill(event.target.value)}>
                {SKILL_OPTIONS.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            )}
            <select value={modifierType} onChange={(event) => setModifierType(event.target.value)}>
              {MODIFIER_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={modifierValue}
              onChange={(event) => setModifierValue(parseInteger(event.target.value, 1))}
              aria-label="Modifier value"
            />
            <button type="button" onClick={submitModifier}>
              <MdAdd aria-hidden="true" />
              Add
            </button>
          </div>
        </section>

        <section>
          <h3>Persistent Damage</h3>
          <PersistentDamagePills persistentDamage={participant.persistentDamage} onRemove={onRemovePersistentDamage} />
          <div className="inline-effect-form persistent-form">
            <input
              type="number"
              min="0"
              value={persistentAmount}
              onChange={(event) => setPersistentAmount(Math.max(0, parseInteger(event.target.value, 1)))}
              aria-label="Persistent damage amount"
            />
            <select
              value={persistentDie}
              onChange={(event) => setPersistentDie(event.target.value)}
              aria-label="Persistent damage die"
            >
              {DAMAGE_DICE_OPTIONS.map((die) => (
                <option key={die || 'fixed'} value={die}>
                  {die || 'Fixed'}
                </option>
              ))}
            </select>
            <select
              value={persistentType}
              onChange={(event) => setPersistentType(event.target.value)}
              aria-label="Persistent damage type"
            >
              {PERSISTENT_DAMAGE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value={CUSTOM_DAMAGE_TYPE}>Custom</option>
            </select>
            {persistentType === CUSTOM_DAMAGE_TYPE && (
              <input
                type="text"
                value={persistentCustomType}
                onChange={(event) => setPersistentCustomType(event.target.value)}
                placeholder="Custom type"
                aria-label="Custom persistent damage type"
              />
            )}
            <input
              type="number"
              min="1"
              value={persistentDc}
              onChange={(event) => setPersistentDc(Math.max(1, parseInteger(event.target.value, 15)))}
              aria-label="Persistent recovery DC"
            />
            <button type="button" onClick={submitPersistentDamage}>
              <MdAdd aria-hidden="true" />
              Add
            </button>
          </div>
        </section>
      </details>

      <div className="setup-card-actions">
        <button type="button" onClick={onDuplicate}>
          Duplicate
        </button>
        <button type="button" onClick={onRemove}>
          <MdDelete aria-hidden="true" />
          Remove
        </button>
      </div>
    </article>
  )
}

function AutomationPanel({ automation, onAutomationChange }) {
  return (
    <section className="initiative-side-panel automation-panel">
      <div className="initiative-panel-heading">
        <MdTune aria-hidden="true" />
        <div>
          <h2>Automation</h2>
          <p>Used when turns advance in play mode.</p>
        </div>
      </div>

      <label className="tracker-checkbox">
        <input
          type="checkbox"
          checked={automation.frightened}
          onChange={(event) => onAutomationChange({ frightened: event.target.checked })}
        />
        <span>Auto-decrease frightened</span>
      </label>

      <label className="tracker-checkbox">
        <input
          type="checkbox"
          checked={automation.persistentDamage}
          onChange={(event) => onAutomationChange({ persistentDamage: event.target.checked })}
        />
        <span>Auto-roll persistent damage and recovery</span>
      </label>
      <label className="tracker-checkbox">
        <input
          type="checkbox"
          checked={automation.raisedShield}
          onChange={(event) => onAutomationChange({ raisedShield: event.target.checked })}
        />
        <span>Auto-remove raised shield at start of turn</span>
      </label>
    </section>
  )
}

function GroupPanel({
  participants,
  groups,
  groupName,
  onGroupNameChange,
  onSaveGroup,
  onLoadGroup,
  onDeleteGroup,
  onExportGroup,
  onExportAllGroups,
  onImportGroups,
}) {
  const importInputRef = useRef(null)

  return (
    <section className="initiative-side-panel">
      <div className="initiative-panel-heading">
        <MdGroups aria-hidden="true" />
        <div>
          <h2>Groups</h2>
          <p>Save reusable monster and hazard packs.</p>
        </div>
      </div>
      <div className="group-save-row">
        <input
          type="text"
          value={groupName}
          onChange={(event) => onGroupNameChange(event.target.value)}
          placeholder="Group name"
          aria-label="Encounter group name"
        />
        <button type="button" onClick={onSaveGroup} disabled={participants.length === 0}>
          <MdSave aria-hidden="true" />
          Save
        </button>
      </div>
      <div className="group-transfer-row">
        <button type="button" onClick={onExportAllGroups} disabled={groups.length === 0}>
          <MdFileDownload aria-hidden="true" />
          Export All
        </button>
        <button type="button" onClick={() => importInputRef.current?.click()}>
          <MdFileUpload aria-hidden="true" />
          Import
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            const [file] = event.target.files ?? []
            if (file) onImportGroups(file)
            event.target.value = ''
          }}
          aria-label="Import initiative groups"
          hidden
        />
      </div>
      <div className="saved-group-list">
        {groups.map((group) => (
          <article key={group.id} className="saved-group-card">
            <div>
              <strong>{group.name}</strong>
              <span>{group.members.length} member{group.members.length === 1 ? '' : 's'}</span>
            </div>
            <button type="button" onClick={() => onLoadGroup(group.id)}>
              <MdAdd aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onExportGroup(group.id)} aria-label={`Export ${group.name}`}>
              <MdFileDownload aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onDeleteGroup(group.id)}>
              <MdDelete aria-hidden="true" />
            </button>
          </article>
        ))}
        {groups.length === 0 && <p className="tracker-empty-text">No saved groups.</p>}
      </div>
    </section>
  )
}

function GroupImportDialog({ importState, onToggleGroup, onConfirm, onCancel }) {
  const selectedCount = importState.groups.filter((group) => importState.selectedIds.includes(group.id)).length

  return (
    <div className="group-import-backdrop" role="presentation" onPointerDown={onCancel}>
      <section
        className="group-import-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-import-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="initiative-panel-heading">
          <MdFileUpload aria-hidden="true" />
          <div>
            <h2 id="group-import-title">Import Groups</h2>
            <p>Choose which groups to add from this file.</p>
          </div>
        </div>

        <div className="group-import-list">
          {importState.groups.map((group) => (
            <label key={group.id} className="group-import-option">
              <input
                type="checkbox"
                checked={importState.selectedIds.includes(group.id)}
                onChange={() => onToggleGroup(group.id)}
              />
              <span>
                <strong>{group.name}</strong>
                <small>{group.members.length} member{group.members.length === 1 ? '' : 's'}</small>
              </span>
            </label>
          ))}
        </div>

        <div className="group-import-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="primary-action" onClick={onConfirm} disabled={selectedCount === 0}>
            Import {selectedCount}
          </button>
        </div>
      </section>
    </div>
  )
}

function CombatantTile({
  participant,
  isActive,
  index,
  onSelect,
  onOpenMenu,
  onRemoveCondition,
  onRemoveModifier,
  onRemovePersistentDamage,
}) {
  const longPressTimer = useRef(null)
  const longPressFired = useRef(false)
  const hasConditions = participant.conditions.length > 0
  const hasModifiers = participant.modifiers.length > 0
  const hasPersistentDamage = participant.persistentDamage.length > 0
  const hasNotes = participant.notes.trim().length > 0
  const hasTrackingDetails = hasConditions || hasModifiers || hasPersistentDamage || hasNotes

  const clearLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const startLongPress = (event) => {
    if (event.button && event.button !== 0) return
    longPressFired.current = false
    const { clientX, clientY } = event

    clearLongPress()
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true
      onOpenMenu(participant.id, clientX, clientY)
    }, LONG_PRESS_MS)
  }

  const finishPress = () => {
    clearLongPress()
    if (!longPressFired.current) {
      onSelect(participant.id)
    }
  }

  const openContextMenu = (event) => {
    event.preventDefault()
    clearLongPress()
    onOpenMenu(participant.id, event.clientX, event.clientY)
  }

  return (
    <article
      className={`combatant-tile kind-${participant.kind} ${isActive ? 'is-active' : ''}`}
      onPointerDown={startLongPress}
      onPointerUp={finishPress}
      onPointerCancel={clearLongPress}
      onPointerLeave={clearLongPress}
      onContextMenu={openContextMenu}
    >
      <div className="combatant-tile-top">
        <span className="initiative-rank">{index + 1}</span>
        <div>
          <strong>
            {getParticipantName(participant)}
            {isActive && <span className="active-turn-chip">Now Acting</span>}
          </strong>
          <span>
            {getKindLabel(participant.kind)}
            {participant.kind !== 'player' ? ` (${formatSigned(participant.initiativeModifier)})` : ''}
          </span>
        </div>
      </div>

      <div className="combatant-core-stats">
        <article>
          <span>Init</span>
          <strong>{participant.initiative}</strong>
        </article>
        <article>
          <span>AC</span>
          <strong>{participant.ac || '-'}</strong>
        </article>
        <article>
          <span>HP</span>
          <HpMeter participant={participant} />
        </article>
      </div>

      {hasTrackingDetails && (
        <div className="combatant-tracking">
          {hasConditions && (
            <section>
              <h3>Conditions</h3>
              <ConditionPills conditions={participant.conditions} onRemove={onRemoveCondition} />
            </section>
          )}
          {hasModifiers && (
            <section>
              <h3>Modifiers</h3>
              <ModifierPills modifiers={participant.modifiers} onRemove={onRemoveModifier} />
            </section>
          )}
          {hasPersistentDamage && (
            <section>
              <h3>Persistent</h3>
              <PersistentDamagePills persistentDamage={participant.persistentDamage} onRemove={onRemovePersistentDamage} />
            </section>
          )}
          {hasNotes && (
            <section className="combatant-private-notes">
              <h3>Private Notes</h3>
              <p>{participant.notes}</p>
            </section>
          )}
        </div>
      )}
    </article>
  )
}

function ActionMenu({
  participant,
  anchor,
  onClose,
  onToggleRaisedShield,
  onToggleCondition,
  onSetFrightenedLock,
  onAddCondition,
  onRemoveCondition,
  onAddModifier,
  onRemoveModifier,
  onAddPersistentDamage,
  onRemovePersistentDamage,
  onAdjustHp,
}) {
  const [panel, setPanel] = useState('main')
  const [conditionKey, setConditionKey] = useState('frightened')
  const [conditionValue, setConditionValue] = useState('1')
  const [conditionLocked, setConditionLocked] = useState(false)
  const [conditionLockFloor, setConditionLockFloor] = useState(1)
  const [modifierName, setModifierName] = useState('')
  const [modifierTarget, setModifierTarget] = useState('attack')
  const [modifierSkill, setModifierSkill] = useState(SKILL_OPTIONS[0])
  const [modifierType, setModifierType] = useState('status')
  const [modifierValue, setModifierValue] = useState(1)
  const [persistentAmount, setPersistentAmount] = useState(1)
  const [persistentDie, setPersistentDie] = useState('d6')
  const [persistentType, setPersistentType] = useState('fire')
  const [persistentCustomType, setPersistentCustomType] = useState('')
  const [persistentDc, setPersistentDc] = useState(15)
  const [hpAmount, setHpAmount] = useState(5)

  const frightened = participant.conditions.find((condition) => condition.key === 'frightened')
  const hasRaisedShield = participant.modifiers.some((modifier) => modifier.key === RAISED_SHIELD.key)
  const hasProne = participant.conditions.some((condition) => condition.key === QUICK_CONDITIONS.prone.key)
  const hasOffGuard = participant.conditions.some((condition) => condition.key === QUICK_CONDITIONS.offGuard.key)
  const selectedCondition = getConditionOption(conditionKey)

  const updateConditionKey = (nextConditionKey) => {
    const option = getConditionOption(nextConditionKey)
    setConditionKey(option.key)
    setConditionValue(option.hasValue ? String(option.defaultValue ?? 1) : '')
    setConditionLocked(false)
    setConditionLockFloor(option.key === 'frightened' ? option.defaultValue ?? 1 : 0)
  }

  const submitCondition = () => {
    onAddCondition(createConditionDefinition(conditionKey, conditionValue, conditionLocked, conditionLockFloor))
    updateConditionKey(conditionKey)
    setConditionLocked(false)
    setConditionLockFloor(1)
  }

  const submitModifier = () => {
    onAddModifier({
      key: slugify(`${modifierName || modifierTarget}-${modifierTarget}-${modifierTarget === 'skill' ? modifierSkill : ''}`),
      name: modifierName,
      target: modifierTarget,
      targetDetail: modifierTarget === 'skill' ? modifierSkill : '',
      type: modifierType,
      value: modifierValue,
    })
    setModifierName('')
  }

  const submitPersistentDamage = () => {
    onAddPersistentDamage({
      damageAmount: persistentAmount,
      damageDie: persistentDie,
      damageType: getSelectedPersistentDamageType(persistentType, persistentCustomType),
      dc: persistentDc,
    })
  }

  const radialActions = [
    {
      id: 'shield',
      label: hasRaisedShield ? 'Drop Shield' : 'Raise Shield',
      Icon: MdShield,
      active: hasRaisedShield,
      onClick: onToggleRaisedShield,
    },
    {
      id: 'frightened',
      label: frightened ? 'Remove Frightened' : 'Frightened 1',
      Icon: MdPsychology,
      active: Boolean(frightened),
      onClick: () => onToggleCondition(QUICK_CONDITIONS.frightened),
    },
    {
      id: 'prone',
      label: hasProne ? 'Stand Up' : 'Prone',
      Icon: MdAccessibility,
      active: hasProne,
      onClick: () => onToggleCondition(QUICK_CONDITIONS.prone),
    },
    {
      id: 'off-guard',
      label: hasOffGuard ? 'Remove Off-guard' : 'Off-guard',
      Icon: MdVisibilityOff,
      active: hasOffGuard,
      onClick: () => onToggleCondition(QUICK_CONDITIONS.offGuard),
    },
    { id: 'hp', label: 'HP', Icon: MdHealing, active: panel === 'hp', onClick: () => setPanel('hp') },
    { id: 'modifier', label: 'Modifier', Icon: MdTune, active: panel === 'modifier', onClick: () => setPanel('modifier') },
    { id: 'condition', label: 'Condition', Icon: MdAddCircle, active: panel === 'condition', onClick: () => setPanel('condition') },
    {
      id: 'persistent',
      label: 'Persistent',
      Icon: MdLocalFireDepartment,
      active: panel === 'persistent',
      onClick: () => setPanel('persistent'),
    },
  ]
  const segmentSize = 360 / radialActions.length
  const selectedAction = radialActions.find((action) => action.active)

  return (
    <div className="radial-menu-backdrop" role="presentation" onPointerDown={onClose}>
      <section
        className="radial-menu-card"
        aria-label={`${getParticipantName(participant)} actions`}
        style={{ left: `${anchor.x}px`, top: `${anchor.y}px` }}
      >
        <div className="radial-menu-orbit">
          <svg
            className="radial-menu-wheel"
            viewBox={`0 0 ${RADIAL_VIEWBOX_SIZE} ${RADIAL_VIEWBOX_SIZE}`}
            role="menu"
            aria-label={`${getParticipantName(participant)} radial actions`}
          >
            <circle className="radial-menu-outer-ring" cx={RADIAL_CENTER} cy={RADIAL_CENTER} r={RADIAL_OUTER_RADIUS} />
            {radialActions.map((action, index) => {
              const startAngle = index * segmentSize + RADIAL_GAP_DEGREES / 2
              const endAngle = (index + 1) * segmentSize - RADIAL_GAP_DEGREES / 2
              const midAngle = startAngle + (endAngle - startAngle) / 2
              const labelPoint = getRadialPoint(midAngle, RADIAL_LABEL_RADIUS)
              const iconPoint = getRadialPoint(midAngle, RADIAL_LABEL_RADIUS - 28)
              const labelLines = splitRadialLabel(action.label)
              const Icon = action.Icon

              return (
                <g
                  key={action.id}
                  className={`radial-menu-item radial-action-${action.id} ${action.active ? 'is-active' : ''}`}
                  role="menuitem"
                  tabIndex="0"
                  aria-label={action.label}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={action.onClick}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      action.onClick()
                    }
                  }}
                >
                  <path d={getRadialSegmentPath(startAngle, endAngle)} />
                  <foreignObject
                    x={iconPoint.x - 10}
                    y={iconPoint.y - 10}
                    width="20"
                    height="20"
                    className="radial-menu-icon"
                  >
                    <Icon aria-hidden="true" />
                  </foreignObject>
                  <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle">
                    {labelLines.map((line, lineIndex) => (
                      <tspan
                        key={line}
                        x={labelPoint.x}
                        dy={lineIndex === 0 ? `${(1 - labelLines.length) * 0.45}em` : '1.05em'}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              )
            })}
            <g className="radial-menu-center" onPointerDown={(event) => event.stopPropagation()}>
              <circle className="radial-menu-center-disc" cx={RADIAL_CENTER} cy={RADIAL_CENTER} r={RADIAL_INNER_RADIUS - 10} />
              <text className="radial-menu-center-text" x={RADIAL_CENTER} y={RADIAL_CENTER - 6} textAnchor="middle">
                {getParticipantName(participant)}
              </text>
              <text className="radial-menu-center-subtext" x={RADIAL_CENTER} y={RADIAL_CENTER + 13} textAnchor="middle">
                {selectedAction?.label ?? 'Tap action'}
              </text>
            </g>
          </svg>
        </div>

        {panel !== 'main' && (
          <div className="radial-action-panel" onPointerDown={(event) => event.stopPropagation()}>
            <div className="radial-action-panel-heading">
              <span>{getKindLabel(participant.kind)}</span>
              <strong>{getParticipantName(participant)}</strong>
            </div>

            {panel === 'hp' && (
              <div className="action-form">
                <h3>Adjust HP</h3>
                <div className="hp-action-row">
                  <input
                    type="number"
                    min="1"
                    value={hpAmount}
                    onChange={(event) => setHpAmount(Math.max(1, parseInteger(event.target.value, 1)))}
                    aria-label="HP amount"
                  />
                  <button type="button" onClick={() => onAdjustHp(-hpAmount)}>
                    <MdRemove aria-hidden="true" />
                    Damage
                  </button>
                  <button type="button" onClick={() => onAdjustHp(hpAmount)}>
                    <MdHealing aria-hidden="true" />
                    Heal
                  </button>
                </div>
              </div>
            )}

            {panel === 'modifier' && (
              <div className="action-form">
                <h3>Attack, Skill, Save Modifiers</h3>
                <ModifierPills modifiers={participant.modifiers} onRemove={onRemoveModifier} />
                <div className="menu-form-grid modifier-menu-form">
                  <input
                    type="text"
                    value={modifierName}
                    onChange={(event) => setModifierName(event.target.value)}
                    placeholder="Name (optional)"
                    aria-label="Modifier name"
                  />
                  <select value={modifierTarget} onChange={(event) => setModifierTarget(event.target.value)}>
                    {MODIFIER_TARGETS.map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                  {modifierTarget === 'skill' && (
                    <select value={modifierSkill} onChange={(event) => setModifierSkill(event.target.value)}>
                      {SKILL_OPTIONS.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                  )}
                  <select value={modifierType} onChange={(event) => setModifierType(event.target.value)}>
                    {MODIFIER_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={modifierValue}
                    onChange={(event) => setModifierValue(parseInteger(event.target.value, 1))}
                    aria-label="Modifier value"
                  />
                  <button type="button" onClick={submitModifier}>
                    <MdAdd aria-hidden="true" />
                    Add
                  </button>
                </div>
              </div>
            )}

            {panel === 'condition' && (
              <div className="action-form">
                <h3>Conditions</h3>
                <ConditionPills conditions={participant.conditions} onRemove={onRemoveCondition} />
                {frightened && (
                  <div className="frightened-lock-controls">
                    <label className="tracker-checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(frightened.locked)}
                        onChange={(event) => onSetFrightenedLock(event.target.checked, frightened.floor ?? 1)}
                      />
                      <span>Lock frightened</span>
                    </label>
                    {frightened.locked && (
                      <label>
                        <span>Lock at</span>
                        <input
                          type="number"
                          min="0"
                          value={frightened.floor ?? 1}
                          onChange={(event) =>
                            onSetFrightenedLock(true, Math.max(0, parseInteger(event.target.value, 1)))
                          }
                          aria-label="Frightened lock floor"
                        />
                      </label>
                    )}
                  </div>
                )}
                <div className="menu-form-grid condition-menu-form">
                  <select
                    value={conditionKey}
                    onChange={(event) => updateConditionKey(event.target.value)}
                    aria-label="Condition"
                  >
                    {CONDITION_OPTIONS.map((condition) => (
                      <option key={condition.key} value={condition.key}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={conditionValue}
                    onChange={(event) => setConditionValue(event.target.value)}
                    placeholder="Value"
                    aria-label="Condition value"
                    disabled={!selectedCondition.hasValue}
                  />
                  {conditionKey === 'frightened' && (
                    <>
                      <label className="tracker-checkbox compact">
                        <input
                          type="checkbox"
                          checked={conditionLocked}
                          onChange={(event) => setConditionLocked(event.target.checked)}
                        />
                        <span>Lock</span>
                      </label>
                      {conditionLocked && (
                        <input
                          type="number"
                          min="0"
                          value={conditionLockFloor}
                          onChange={(event) => setConditionLockFloor(Math.max(0, parseInteger(event.target.value, 1)))}
                          aria-label="Frightened lock floor"
                        />
                      )}
                    </>
                  )}
                  <button type="button" onClick={submitCondition}>
                    <MdAdd aria-hidden="true" />
                    Add
                  </button>
                </div>
              </div>
            )}

            {panel === 'persistent' && (
              <div className="action-form">
                <h3>Persistent Damage</h3>
                <PersistentDamagePills persistentDamage={participant.persistentDamage} onRemove={onRemovePersistentDamage} />
                <div className="menu-form-grid persistent-menu-form">
                  <input
                    type="number"
                    min="0"
                    value={persistentAmount}
                    onChange={(event) => setPersistentAmount(Math.max(0, parseInteger(event.target.value, 1)))}
                    aria-label="Persistent damage amount"
                  />
                  <select
                    value={persistentDie}
                    onChange={(event) => setPersistentDie(event.target.value)}
                    aria-label="Persistent damage die"
                  >
                    {DAMAGE_DICE_OPTIONS.map((die) => (
                      <option key={die || 'fixed'} value={die}>
                        {die || 'Fixed'}
                      </option>
                    ))}
                  </select>
                  <select
                    value={persistentType}
                    onChange={(event) => setPersistentType(event.target.value)}
                    aria-label="Persistent damage type"
                  >
                    {PERSISTENT_DAMAGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                    <option value={CUSTOM_DAMAGE_TYPE}>Custom</option>
                  </select>
                  {persistentType === CUSTOM_DAMAGE_TYPE && (
                    <input
                      type="text"
                      value={persistentCustomType}
                      onChange={(event) => setPersistentCustomType(event.target.value)}
                      placeholder="Custom type"
                      aria-label="Custom persistent damage type"
                    />
                  )}
                  <input
                    type="number"
                    min="1"
                    value={persistentDc}
                    onChange={(event) => setPersistentDc(Math.max(1, parseInteger(event.target.value, 15)))}
                    aria-label="Persistent recovery DC"
                  />
                  <button type="button" onClick={submitPersistentDamage}>
                    <MdAdd aria-hidden="true" />
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default function InitiativeTracker({ onBackHome }) {
  const [initialState] = useState(() => getInitialState())
  const [participants, setParticipants] = useState(initialState.participants)
  const [groups, setGroups] = useState(initialState.groups)
  const [mode, setMode] = useState(initialState.mode)
  const [activeId, setActiveId] = useState(initialState.activeId)
  const [round, setRound] = useState(initialState.round)
  const [automation, setAutomation] = useState(initialState.automation)
  const [combatLog, setCombatLog] = useState(initialState.combatLog)
  const [groupName, setGroupName] = useState('')
  const [actionMenu, setActionMenu] = useState(null)
  const [groupImport, setGroupImport] = useState(null)

  const orderedParticipants = useMemo(() => sortParticipants(participants), [participants])
  const activeParticipant = orderedParticipants.find((participant) => participant.id === activeId) ?? orderedParticipants[0]
  const selectedActionParticipant = actionMenu
    ? participants.find((participant) => participant.id === actionMenu.participantId)
    : null

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        participants,
        groups,
        mode,
        activeId,
        round,
        automation,
        combatLog,
      }),
    )
  }, [participants, groups, mode, activeId, round, automation, combatLog])

  const updateParticipant = (participantId, updates) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === participantId ? normalizeParticipant({ ...participant, ...updates }) : participant,
      ),
    )
  }

  const addParticipant = (kind) => {
    const nextParticipant = createParticipant(kind)
    setParticipants((currentParticipants) => [...currentParticipants, nextParticipant])
    setActiveId(nextParticipant.id)
  }

  const removeParticipant = (participantId) => {
    setParticipants((currentParticipants) => currentParticipants.filter((participant) => participant.id !== participantId))
    if (activeId === participantId) {
      setActiveId('')
    }
  }

  const duplicateParticipant = (participantId) => {
    const source = participants.find((participant) => participant.id === participantId)
    if (!source) return

    const clone = normalizeParticipant({
      ...source,
      id: createId(source.kind),
      name: `${getParticipantName(source)} Copy`,
    })

    setParticipants((currentParticipants) => [...currentParticipants, clone])
    setActiveId(clone.id)
  }

  const addCondition = (participantId, definition) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) => {
        if (participant.id !== participantId) return participant

        const condition = createCondition(definition)
        const existing = participant.conditions.find((entry) => entry.key === condition.key)

        if (existing) {
          return {
            ...participant,
            conditions: participant.conditions.map((entry) =>
              entry.key === condition.key
                ? {
                    ...entry,
                    value: condition.value ?? entry.value,
                    locked: condition.locked || entry.locked,
                    floor: condition.locked ? condition.floor : entry.floor,
                  }
                : entry,
            ),
          }
        }

        return {
          ...participant,
          conditions: [...participant.conditions, condition],
        }
      }),
    )
  }

  const removeCondition = (participantId, conditionId) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              conditions: participant.conditions.filter((condition) => condition.id !== conditionId),
            }
          : participant,
      ),
    )
  }

  const toggleCondition = (participantId, definition) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) => {
        if (participant.id !== participantId) return participant

        const key = definition.key ?? definition.id
        const exists = participant.conditions.some((condition) => condition.key === key)

        return {
          ...participant,
          conditions: exists
            ? participant.conditions.filter((condition) => condition.key !== key)
            : [...participant.conditions, createCondition(definition)],
        }
      }),
    )
  }

  const setFrightenedLock = (participantId, locked, floor = 1) => {
    const nextFloor = Math.max(0, parseInteger(floor, 1))

    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) => {
        if (participant.id !== participantId) return participant

        const frightened = participant.conditions.find((condition) => condition.key === 'frightened')
        if (!frightened) return participant

        return {
          ...participant,
          conditions: participant.conditions.map((condition) =>
            condition.key === 'frightened'
              ? {
                  ...condition,
                  value: Math.max(condition.value ?? 1, locked ? nextFloor : 0),
                  locked,
                  floor: locked ? nextFloor : 0,
                }
              : condition,
          ),
        }
      }),
    )
  }

  const addModifier = (participantId, definition) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              modifiers: [...participant.modifiers, createModifier(definition)],
            }
          : participant,
      ),
    )
  }

  const removeModifier = (participantId, modifierId) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              modifiers: participant.modifiers.filter((modifier) => modifier.id !== modifierId),
            }
          : participant,
      ),
    )
  }

  const toggleRaisedShield = (participantId) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) => {
        if (participant.id !== participantId) return participant

        const hasShield = participant.modifiers.some((modifier) => modifier.key === RAISED_SHIELD.key)

        return {
          ...participant,
          modifiers: hasShield
            ? participant.modifiers.filter((modifier) => modifier.key !== RAISED_SHIELD.key)
            : [...participant.modifiers, createModifier(RAISED_SHIELD)],
        }
      }),
    )
  }

  const addPersistentDamage = (participantId, definition) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              persistentDamage: [...participant.persistentDamage, createPersistentDamage(definition)],
            }
          : participant,
      ),
    )
  }

  const removePersistentDamage = (participantId, damageId) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              persistentDamage: participant.persistentDamage.filter((damage) => damage.id !== damageId),
            }
          : participant,
      ),
    )
  }

  const adjustHp = (participantId, amount) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === participantId ? applyHpDeltaToParticipant(participant, amount) : participant,
      ),
    )
  }

  const openActionMenu = (participantId, clientX, clientY) => {
    const viewportWidth = typeof window === 'undefined' ? RADIAL_VIEWBOX_SIZE : window.innerWidth
    const viewportHeight = typeof window === 'undefined' ? RADIAL_VIEWBOX_SIZE : window.innerHeight
    const wheelSize = Math.min(380, viewportWidth * 0.88)
    const radius = wheelSize / 2
    const panelHalfWidth = Math.min(260, Math.max(0, viewportWidth - 24) / 2)
    const fallbackX = viewportWidth / 2
    const fallbackY = viewportHeight / 2
    const clampToViewport = (coordinate, viewportSize) => {
      const edgeSpace = viewportSize === viewportWidth ? Math.max(radius + 12, panelHalfWidth + 12) : radius + 12
      const minimum = Math.min(edgeSpace, viewportSize / 2)
      const maximum = Math.max(viewportSize - edgeSpace, viewportSize / 2)
      return clampNumber(coordinate, minimum, maximum)
    }

    setActiveId(participantId)
    setActionMenu({
      participantId,
      x: clampToViewport(clientX ?? fallbackX, viewportWidth),
      y: clampToViewport(clientY ?? fallbackY, viewportHeight),
    })
  }

  const advanceTurn = () => {
    if (orderedParticipants.length === 0) return

    const currentId = activeParticipant?.id ?? orderedParticipants[0].id
    const currentIndex = orderedParticipants.findIndex((participant) => participant.id === currentId)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % orderedParticipants.length : 0
    const nextParticipant = orderedParticipants[nextIndex]
    const nextId = nextParticipant.id
    const turnLog = []
    const participantsAfterEndTurn = participants.map((participant) => {
      if (participant.id !== currentId) return participant

      const result = processEndOfTurnAutomation(participant, automation)
      turnLog.push(...result.logEntries)
      return result.participant
    })

    const participantsAfterStartTurn = participantsAfterEndTurn.map((participant) => {
      if (participant.id !== nextId) return participant

      const result = processStartOfTurnAutomation(participant, automation)
      turnLog.push(...result.logEntries)
      return result.participant
    })

    setParticipants(participantsAfterStartTurn)

    if (turnLog.length > 0) {
      setCombatLog((currentLog) => [...turnLog, ...currentLog].slice(0, 8))
    }

    setActiveId(nextId)

    if (nextIndex === 0) {
      setRound((currentRound) => currentRound + 1)
    }
  }

  const previousTurn = () => {
    if (orderedParticipants.length === 0) return

    const currentId = activeParticipant?.id ?? orderedParticipants[0].id
    const currentIndex = orderedParticipants.findIndex((participant) => participant.id === currentId)
    const previousIndex = currentIndex <= 0 ? orderedParticipants.length - 1 : currentIndex - 1

    setActiveId(orderedParticipants[previousIndex].id)
    if (currentIndex === 0 && round > 1) {
      setRound((currentRound) => Math.max(1, currentRound - 1))
    }
  }

  const startInitiative = () => {
    if (participants.length === 0) return

    const initiativeResults = participants.map(rollInitiativeForParticipant)
    const nextParticipants = initiativeResults.map((result) => result.participant)
    const nextOrderedParticipants = sortParticipants(nextParticipants)
    const initiativeLog = initiativeResults.map((result) => result.logEntry).filter(Boolean)

    setParticipants(nextParticipants)
    setActiveId(nextOrderedParticipants[0]?.id ?? '')
    setRound(1)
    if (initiativeLog.length > 0) {
      setCombatLog((currentLog) => [...initiativeLog, ...currentLog].slice(0, 8))
    }
    setMode('initiative')
  }

  const changeMode = (nextMode) => {
    if (nextMode === 'initiative' && mode !== 'initiative') {
      startInitiative()
      return
    }

    setMode(nextMode)
  }

  const saveGroup = () => {
    const name = groupName.trim() || `Encounter Group ${groups.length + 1}`
    const members = participants.filter((participant) => participant.kind !== 'player')
    const savedMembers = (members.length > 0 ? members : participants).map(normalizeGroupMemberForSave)

    if (savedMembers.length === 0) return

    setGroups((currentGroups) => [
      ...currentGroups,
      {
        id: createId('group'),
        name,
        members: savedMembers,
      },
    ])
    setGroupName('')
  }

  const loadGroup = (groupId) => {
    const group = groups.find((entry) => entry.id === groupId)
    if (!group) return

    setParticipants((currentParticipants) => [
      ...currentParticipants,
      ...group.members.map((member) =>
        normalizeParticipant({
          ...member,
          id: createId(member.kind ?? 'combatant'),
        }),
      ),
    ])
  }

  const deleteGroup = (groupId) => {
    setGroups((currentGroups) => currentGroups.filter((group) => group.id !== groupId))
  }

  const exportGroup = (groupId) => {
    const group = groups.find((entry) => entry.id === groupId)
    if (!group) return

    downloadJsonFile(createDownloadName(group.name, 'initiative-group'), createGroupExportPayload([group]))
  }

  const exportAllGroups = () => {
    if (groups.length === 0) return

    downloadJsonFile('initiative-groups.json', createGroupExportPayload(groups))
  }

  const importGroups = async (file) => {
    try {
      const payload = JSON.parse(await file.text())
      const importedGroups = getGroupsFromImportPayload(payload)
      if (importedGroups.length === 0) return

      setGroupImport({
        groups: importedGroups,
        selectedIds: importedGroups.map((group) => group.id),
      })
    } catch {
      // Ignore malformed files; the file input stays ready for another import attempt.
    }
  }

  const toggleImportGroup = (groupId) => {
    setGroupImport((currentImport) => {
      if (!currentImport) return currentImport

      const isSelected = currentImport.selectedIds.includes(groupId)
      return {
        ...currentImport,
        selectedIds: isSelected
          ? currentImport.selectedIds.filter((selectedId) => selectedId !== groupId)
          : [...currentImport.selectedIds, groupId],
      }
    })
  }

  const confirmGroupImport = () => {
    if (!groupImport) return

    const selectedGroups = groupImport.groups.filter((group) => groupImport.selectedIds.includes(group.id))
    if (selectedGroups.length > 0) {
      setGroups((currentGroups) => [...currentGroups, ...selectedGroups])
    }

    setGroupImport(null)
  }

  const resetEncounter = () => {
    setParticipants([])
    setActiveId('')
    setRound(1)
    setMode('edit')
    setCombatLog([])
    setActionMenu(null)
  }

  const clearRoster = () => {
    setParticipants([])
    setActiveId('')
    setRound(1)
    setMode('edit')
    setCombatLog([])
    setActionMenu(null)
  }

  const clearMonstersAndHazards = () => {
    setParticipants((currentParticipants) => currentParticipants.filter((participant) => participant.kind === 'player'))
    setActiveId('')
    setRound(1)
    setMode('edit')
    setCombatLog([])
    setActionMenu(null)
  }

  return (
    <main className="initiative-shell">
      <header className="workspace-top-bar initiative-top-bar">
        <button type="button" className="home-back-button" onClick={onBackHome}>
          <MdArrowBack aria-hidden="true" />
          Home
        </button>
        <div className="initiative-title-row">
          <div>
            <p className="workspace-kicker">PF2e table tools</p>
            <h1>Initiative Tracker</h1>
            <p>Press and hold a combatant in play mode to open its radial action menu.</p>
          </div>
          <ModeSwitch mode={mode} onModeChange={changeMode} disabled={participants.length === 0} />
        </div>
      </header>

      {mode === 'edit' ? (
        <section className="initiative-edit-workspace" aria-label="Initiative tracker setup">
          <section className="initiative-roster-panel">
            <div className="initiative-roster-toolbar">
              <div>
                <h2>Encounter Setup</h2>
                <p>{participants.length} combatant{participants.length === 1 ? '' : 's'}</p>
              </div>
              <div className="initiative-add-actions">
                <button type="button" onClick={() => addParticipant('player')}>
                  <MdAdd aria-hidden="true" />
                  Player
                </button>
                <button type="button" onClick={() => addParticipant('monster')}>
                  <MdAdd aria-hidden="true" />
                  Monster
                </button>
                <button type="button" onClick={() => addParticipant('hazard')}>
                  <MdAdd aria-hidden="true" />
                  Hazard
                </button>
              </div>
            </div>

            <div className="setup-card-list">
              {participants.map((participant) => (
                <EditParticipantCard
                  key={participant.id}
                  participant={participant}
                  onUpdate={(updates) => updateParticipant(participant.id, updates)}
                  onRemove={() => removeParticipant(participant.id)}
                  onDuplicate={() => duplicateParticipant(participant.id)}
                  onAddCondition={(condition) => addCondition(participant.id, condition)}
                  onRemoveCondition={(conditionId) => removeCondition(participant.id, conditionId)}
                  onAddModifier={(modifier) => addModifier(participant.id, modifier)}
                  onRemoveModifier={(modifierId) => removeModifier(participant.id, modifierId)}
                  onAddPersistentDamage={(damage) => addPersistentDamage(participant.id, damage)}
                  onRemovePersistentDamage={(damageId) => removePersistentDamage(participant.id, damageId)}
                />
              ))}
              {participants.length === 0 && (
                <div className="initiative-empty-roster">
                  <MdGroups aria-hidden="true" />
                  <h2>Build an encounter roster.</h2>
                </div>
              )}
            </div>
          </section>

          <aside className="initiative-sidebar">
            <section className="initiative-side-panel">
              <div className="initiative-panel-heading">
                <MdPlayArrow aria-hidden="true" />
                <div>
                  <h2>Encounter</h2>
                  <p>Round {round}</p>
                </div>
              </div>
              <div className="encounter-summary">
                <article>
                  <span>Players</span>
                  <strong>{participants.filter((participant) => participant.kind === 'player').length}</strong>
                </article>
                <article>
                  <span>Monsters</span>
                  <strong>{participants.filter((participant) => participant.kind === 'monster').length}</strong>
                </article>
                <article>
                  <span>Hazards</span>
                  <strong>{participants.filter((participant) => participant.kind === 'hazard').length}</strong>
                </article>
              </div>
              <div className="initiative-side-actions">
                <button type="button" className="primary-action" onClick={startInitiative} disabled={participants.length === 0}>
                  <MdPlayArrow aria-hidden="true" />
                  Start Play
                </button>
                <button type="button" onClick={clearRoster} disabled={participants.length === 0}>
                  <MdDelete aria-hidden="true" />
                  Clear Roster
                </button>
                <button
                  type="button"
                  onClick={clearMonstersAndHazards}
                  disabled={!participants.some((participant) => participant.kind !== 'player')}
                >
                  <MdDelete aria-hidden="true" />
                  Clear Monsters & Hazards
                </button>
                <button type="button" onClick={resetEncounter} disabled={participants.length === 0}>
                  <MdRefresh aria-hidden="true" />
                  Reset
                </button>
              </div>
            </section>

            <AutomationPanel
              automation={automation}
              onAutomationChange={(updates) => setAutomation((currentAutomation) => ({ ...currentAutomation, ...updates }))}
            />

            <GroupPanel
              participants={participants}
              groups={groups}
              groupName={groupName}
              onGroupNameChange={setGroupName}
              onSaveGroup={saveGroup}
              onLoadGroup={loadGroup}
              onDeleteGroup={deleteGroup}
              onExportGroup={exportGroup}
              onExportAllGroups={exportAllGroups}
              onImportGroups={importGroups}
            />
          </aside>
        </section>
      ) : (
        <section className="initiative-play-workspace" aria-label="Initiative tracker play mode">
          <div className="initiative-turn-toolbar">
            <div className="round-counter">
              <span>Round</span>
              <strong>{round}</strong>
            </div>
            <div className="active-turn-label">
              <span>Active</span>
              <strong>{activeParticipant ? getParticipantName(activeParticipant) : 'None'}</strong>
            </div>
            <div className="turn-toolbar-actions">
              <button type="button" onClick={previousTurn} disabled={orderedParticipants.length === 0}>
                <MdSkipPrevious aria-hidden="true" />
                Previous
              </button>
              <button type="button" className="primary-action" onClick={advanceTurn} disabled={orderedParticipants.length === 0}>
                <MdSkipNext aria-hidden="true" />
                End Turn
              </button>
              <button type="button" onClick={() => setMode('edit')}>
                <MdTune aria-hidden="true" />
                Edit
              </button>
            </div>
          </div>

          <section className="combat-board" aria-label="Combatants">
            {orderedParticipants.map((participant, index) => (
              <CombatantTile
                key={participant.id}
                participant={participant}
                index={index}
                isActive={participant.id === activeParticipant?.id}
                onSelect={setActiveId}
                onOpenMenu={openActionMenu}
                onRemoveCondition={(conditionId) => removeCondition(participant.id, conditionId)}
                onRemoveModifier={(modifierId) => removeModifier(participant.id, modifierId)}
                onRemovePersistentDamage={(damageId) => removePersistentDamage(participant.id, damageId)}
              />
            ))}
          </section>

          <aside className="combat-log-panel">
            <div className="initiative-panel-heading combat-log-heading">
              <button
                type="button"
                className="combat-log-clear-icon"
                onClick={() => setCombatLog([])}
                disabled={combatLog.length === 0}
                aria-label="Clear automation log"
              >
                <MdRefresh aria-hidden="true" />
              </button>
              <div>
                <h2>Automation Log</h2>
                <p>Frightened, persistent damage, and raised shield updates.</p>
              </div>
            </div>
            {combatLog.length > 0 ? (
              <ol>
                {combatLog.map((entry, index) => (
                  <li key={`${entry}-${index}`}>{entry}</li>
                ))}
              </ol>
            ) : (
              <p className="tracker-empty-text">No automated changes yet.</p>
            )}
          </aside>
        </section>
      )}

      {selectedActionParticipant && (
        <ActionMenu
          participant={selectedActionParticipant}
          anchor={{ x: actionMenu.x, y: actionMenu.y }}
          onClose={() => setActionMenu(null)}
          onToggleRaisedShield={() => toggleRaisedShield(selectedActionParticipant.id)}
          onToggleCondition={(condition) => toggleCondition(selectedActionParticipant.id, condition)}
          onSetFrightenedLock={(locked, floor) => setFrightenedLock(selectedActionParticipant.id, locked, floor)}
          onAddCondition={(condition) => addCondition(selectedActionParticipant.id, condition)}
          onRemoveCondition={(conditionId) => removeCondition(selectedActionParticipant.id, conditionId)}
          onAddModifier={(modifier) => addModifier(selectedActionParticipant.id, modifier)}
          onRemoveModifier={(modifierId) => removeModifier(selectedActionParticipant.id, modifierId)}
          onAddPersistentDamage={(damage) => addPersistentDamage(selectedActionParticipant.id, damage)}
          onRemovePersistentDamage={(damageId) => removePersistentDamage(selectedActionParticipant.id, damageId)}
          onAdjustHp={(amount) => adjustHp(selectedActionParticipant.id, amount)}
        />
      )}

      {groupImport && (
        <GroupImportDialog
          importState={groupImport}
          onToggleGroup={toggleImportGroup}
          onConfirm={confirmGroupImport}
          onCancel={() => setGroupImport(null)}
        />
      )}
    </main>
  )
}
