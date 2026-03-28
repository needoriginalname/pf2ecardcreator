import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  paragraph,
  templateDescriptionParagraphs,
} from './helpers'

const armorTemplate = createTemplateDefinition({
  id: 'armor',
  label: 'Item: Armor',
  description: 'Armor starter with AoN armor statistics in the side panel.',
  starterCard: createTemplateCard({
    templateId: 'armor',
    actionCustom: inlineValue('Armor', 'right'),
    name: inlineValue('Chain Mail'),
    traits: inlineValue('Flexible, Noisy', 'center'),
    frontArtworkLayout: 'art-left-text-right',
    frontArtworkText: templateDescriptionParagraphs(
      ['Price', '6 gp'],
      ['AC Bonus', '+4'],
      ['Dex Cap', '+1'],
      ['Check Penalty', '-2'],
      ['Speed Penalty', '-5 ft.'],
      ['Strength', '+3'],
      ['Bulk', '2'],
      ['Category', 'medium'],
      ['Group', 'chain']
    ),
    description: [
      paragraph(
        'A suit of chain mail consists of several pieces of linked metal rings that protect most of the body.'
      ),
      labeledParagraph(
        'Specialization',
        'Chain: Reduce damage from critical hits according to your armor potency.'
      ),
    ],
  }),
})

export default armorTemplate
