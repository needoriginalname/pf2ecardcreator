import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  paragraph,
  templateDescriptionParagraphs,
} from './helpers'

const shieldTemplate = createTemplateDefinition({
  id: 'shield',
  label: 'Item: Shield',
  description: 'Shield starter with AoN shield defensive stats on the side.',
  starterCard: createTemplateCard({
    templateId: 'shield',
    actionCustom: inlineValue('Shield', 'right'),
    name: inlineValue('Steel Shield'),
    traits: inlineValue('Shield', 'center'),
    frontArtworkLayout: 'art-left-text-right',
    frontArtworkText: templateDescriptionParagraphs(
      ['Price', '2 gp'],
      ['AC Bonus', '+2'],
      ['Bulk', '1'],
      ['Hardness', '5'],
      ['HP', '20'],
      ['BT', '10']
    ),
    description: [
      paragraph(
        'Like wooden shields, steel shields come in a variety of shapes and sizes. Though more expensive than wooden shields, steel shields are more durable.'
      ),
      labeledParagraph(
        'Special',
        'Add Raise a Shield, Shield Block, or magic shield abilities here.'
      ),
    ],
  }),
})

export default shieldTemplate
