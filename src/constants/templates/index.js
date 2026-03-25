import adventuringGearTemplate from './adventuringGear'
import armorTemplate from './armor'
import genericTemplate from './generic'
import hazardTemplate from './hazard'
import monsterTemplate from './monster'
import shieldTemplate from './shield'
import spellTemplate from './spell'
import weaponTemplate from './weapon'
import { GENERIC_TEMPLATE_ID } from './helpers'

const TEMPLATE_DEFINITIONS = [
  genericTemplate,
  spellTemplate,
  weaponTemplate,
  shieldTemplate,
  armorTemplate,
  adventuringGearTemplate,
  monsterTemplate,
  hazardTemplate,
]

const TEMPLATE_MAP = Object.fromEntries(
  TEMPLATE_DEFINITIONS.map((templateDefinition) => [templateDefinition.id, templateDefinition])
)

export { GENERIC_TEMPLATE_ID }

export const CARD_TEMPLATE_OPTIONS = TEMPLATE_DEFINITIONS.map((templateDefinition) => ({
  value: templateDefinition.id,
  label: templateDefinition.label,
}))

export const getTemplateDetails = (templateId) => {
  const templateDefinition = TEMPLATE_MAP[templateId] ?? TEMPLATE_MAP[GENERIC_TEMPLATE_ID]
  return {
    description: templateDefinition.description,
    placeholders: templateDefinition.placeholders,
  }
}

export const createTemplateOverrides = (templateId) =>
  (TEMPLATE_MAP[templateId] ?? TEMPLATE_MAP[GENERIC_TEMPLATE_ID]).createOverrides()
