import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  templateDescriptionParagraphs,
} from './helpers'

const hazardTemplate = createTemplateDefinition({
  id: 'hazard',
  label: 'Hazard',
  description: 'Hazard starter with AoN stealth, disable, defense, and reset fields.',
  starterCard: createTemplateCard({
    templateId: 'hazard',
    actionCustom: inlineValue('Hazard 8', 'right'),
    name: inlineValue('Poisoned Dart Gallery'),
    traits: inlineValue('Complex, Mechanical, Trap', 'center'),
    frontArtworkLayout: 'art-left-text-right',
    frontArtworkText: templateDescriptionParagraphs(
      ['Stealth', '+16 or DC 31'],
      ['Description', 'Hidden control panel at the end of the hallway'],
      ['Disable', 'DC 21 Thievery on the control panel'],
      ['AC', '27'],
      ['Fort / Ref', '+13 / +17'],
      ['Hardness', '14'],
      ['HP / BT', '56 / 28'],
      ['Reset', '1 minute']
    ),
    description: [
      labeledParagraph(
        'Trigger',
        'A creature enters the hallway or ends its turn there.'
      ),
      labeledParagraph(
        'Routine',
        'Launch one dart against every creature in the gallery.'
      ),
      labeledParagraph(
        'Attack',
        'Ranged poisoned dart +21; 3d4 piercing plus poison.'
      ),
    ],
  }),
})

export default hazardTemplate
