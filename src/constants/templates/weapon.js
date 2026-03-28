import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  paragraph,
  templateDescriptionParagraphs,
} from './helpers'

const weaponTemplate = createTemplateDefinition({
  id: 'weapon',
  label: 'Item: Weapon',
  description: 'Base weapon starter using AoN weapon stats in the side panel.',
  starterCard: createTemplateCard({
    templateId: 'weapon',
    actionCustom: inlineValue('Weapon', 'right'),
    name: inlineValue('Longsword'),
    traits: inlineValue('Versatile P', 'center'),
    frontArtworkLayout: 'art-left-text-right',
    frontArtworkText: templateDescriptionParagraphs(
      ['Price', '1 gp'],
      ['Damage', '1d8 slashing'],
      ['Hands', '1'],
      ['Bulk', '1'],
      ['Type', 'melee'],
      ['Category', 'martial'],
      ['Group', 'sword']
    ),
    description: [
      paragraph(
        "Longswords can be one-edged or two-edged swords. Their blades are heavy and they're between 3 and 4 feet in length."
      ),
      labeledParagraph(
        'Critical Specialization',
        'Sword: The target is made off-guard until the start of your next turn.'
      ),
    ],
  }),
})

export default weaponTemplate
