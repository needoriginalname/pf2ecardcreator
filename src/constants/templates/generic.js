import { GENERIC_TEMPLATE_ID } from './helpers'

const genericTemplate = {
  id: GENERIC_TEMPLATE_ID,
  label: 'Generic / Custom',
  description: 'Freeform card with the current generic layout.',
  placeholders: {
    name: 'Card name',
    traits: 'Trait, Trait',
    action: 'Optional header text',
    description: 'Main effect text',
    artSide: 'Optional side text',
  },
  createOverrides: () => ({
    templateId: GENERIC_TEMPLATE_ID,
  }),
}

export default genericTemplate
