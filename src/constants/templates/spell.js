import { inlineValue, labeledParagraph, paragraph, templateDescriptionParagraphs } from './helpers'

const spellTemplate = {
  id: 'spell',
  label: 'Spell',
  description: 'AoN-style spell starter with casting details in the side panel and effect text below.',
  placeholders: {
    name: 'Fireball',
    traits: 'Concentrate, Fire, Manipulate',
    action: 'Spell 3',
    description: 'Spell effect and heightened entries',
    artSide: 'Traditions, cast, range, area, defense, duration',
  },
  createOverrides: () => ({
    templateId: 'spell',
    actionIcon: '',
    actionCustom: inlineValue('Spell 3', 'right'),
    name: inlineValue('Fireball'),
    traits: inlineValue('Concentrate, Fire, Manipulate', 'center'),
    frontArtworkLayout: 'art-left-text-right',
    frontArtworkText: templateDescriptionParagraphs(
      ['Traditions', 'arcane, primal'],
      ['Cast', '2 actions'],
      ['Range', '500 feet'],
      ['Area', '20-foot burst'],
      ['Defense', 'basic Reflex'],
      ['Duration', 'instantaneous']
    ),
    description: [
      paragraph('A roaring blast of fire detonates at a spot you designate, dealing 6d6 fire damage.'),
      labeledParagraph('Heightened (+1)', 'Increase the damage by 2d6.'),
    ],
  }),
}

export default spellTemplate
