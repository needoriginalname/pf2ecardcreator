import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  templateDescriptionParagraphs,
} from './helpers'

const monsterTemplate = createTemplateDefinition({
  id: 'monster',
  label: 'Monster',
  description: 'Creature starter with the quick stat block in the side panel and abilities below.',
  starterCard: createTemplateCard({
    templateId: 'monster',
    actionCustom: inlineValue('Creature 10', 'right'),
    name: inlineValue('Young Red Dragon'),
    traits: inlineValue('CE, Large, Dragon, Fire', 'center'),
    frontArtworkLayout: 'text-left-art-right',
    frontArtworkText: templateDescriptionParagraphs(
      ['Perception', '+20; darkvision, scent 60 feet'],
      ['Languages', 'Common, Draconic'],
      ['Skills', 'Acrobatics +15, Arcana +17, Athletics +22'],
      ['AC', '30'],
      ['Fort / Ref / Will', '+21 / +18 / +19'],
      ['HP', '210'],
      ['Speed', '40 feet, fly 120 feet']
    ),
    description: [
      labeledParagraph('Melee', 'jaws +23, claw +23, tail +21, wing +21'),
      labeledParagraph(
        'Breath Weapon',
        '40-foot cone, 11d6 fire damage, basic Reflex save.'
      ),
      labeledParagraph(
        'Special',
        'List reactions, auras, spells, and signature abilities here.'
      ),
    ],
  }),
})

export default monsterTemplate
