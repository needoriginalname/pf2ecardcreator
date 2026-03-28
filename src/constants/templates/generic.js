import { createTemplateCard, createTemplateDefinition, GENERIC_TEMPLATE_ID } from './helpers'

const genericTemplate = createTemplateDefinition({
  id: GENERIC_TEMPLATE_ID,
  label: 'Generic / Custom',
  description: 'Freeform card with the current generic layout.',
  starterCard: createTemplateCard({
    templateId: GENERIC_TEMPLATE_ID,
  }),
})

export default genericTemplate
