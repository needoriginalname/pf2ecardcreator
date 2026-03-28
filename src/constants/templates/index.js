import adventuringGearTemplate from './adventuringGear'
import armorTemplate from './armor'
import genericTemplate from './generic'
import hazardTemplate from './hazard'
import monsterTemplate from './monster'
import shieldTemplate from './shield'
import spellTemplate from './spell'
import weaponTemplate from './weapon'
import {
  GENERIC_TEMPLATE_ID,
  TEMPLATE_DEFINITION_KIND,
  TEMPLATE_DEFINITION_VERSION,
} from './helpers'

const BUILT_IN_TEMPLATE_DEFINITIONS = [
  genericTemplate,
  spellTemplate,
  weaponTemplate,
  shieldTemplate,
  armorTemplate,
  adventuringGearTemplate,
  monsterTemplate,
  hazardTemplate,
].map((templateFile) => templateFile.template ?? templateFile)

const BUILT_IN_TEMPLATE_MAP = Object.fromEntries(
  BUILT_IN_TEMPLATE_DEFINITIONS.map((templateDefinition) => [templateDefinition.id, templateDefinition])
)

export { GENERIC_TEMPLATE_ID, TEMPLATE_DEFINITION_KIND, TEMPLATE_DEFINITION_VERSION }

export const CARD_TEMPLATE_OPTIONS = BUILT_IN_TEMPLATE_DEFINITIONS.map((templateDefinition) => ({
  value: templateDefinition.id,
  label: templateDefinition.label,
}))

const getTemplateMap = (customTemplates = []) =>
  Object.fromEntries(
    [...BUILT_IN_TEMPLATE_DEFINITIONS, ...customTemplates].map((templateDefinition) => [
      templateDefinition.id,
      templateDefinition,
    ])
  )

export const getTemplateOptions = (customTemplates = []) => [
  ...CARD_TEMPLATE_OPTIONS,
  ...customTemplates.map((templateDefinition) => ({
    value: templateDefinition.id,
    label: `${templateDefinition.label} (Custom)`,
  })),
]

export const getTemplateDetails = (templateId, customTemplates = []) => {
  const templateMap = getTemplateMap(customTemplates)
  const templateDefinition = templateMap[templateId] ?? BUILT_IN_TEMPLATE_MAP[GENERIC_TEMPLATE_ID]
  return {
    description: templateDefinition.description,
  }
}

export const createTemplateStarterCard = (templateId, customTemplates = []) => {
  const templateMap = getTemplateMap(customTemplates)
  return structuredClone(
    (templateMap[templateId] ?? BUILT_IN_TEMPLATE_MAP[GENERIC_TEMPLATE_ID]).starterCard
  )
}
