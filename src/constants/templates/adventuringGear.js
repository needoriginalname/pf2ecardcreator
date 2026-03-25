import { inlineValue, labeledParagraph, paragraph, templateDescriptionParagraphs, createCenteredEmptyValue } from './helpers'

const adventuringGearTemplate = {
  id: 'adventuring-gear',
  label: 'Item: Adventuring Gear',
  description: 'Adventuring gear starter with compact item details on the side.',
  placeholders: {
    name: "Adventurer's Pack",
    traits: 'Item 0',
    action: 'Item 0',
    description: 'Gear description and contents',
    artSide: 'Price, hands or usage, bulk, category',
  },
  createOverrides: () => ({
    templateId: 'adventuring-gear',
    actionIcon: '',
    actionCustom: inlineValue('Item 0', 'right'),
    name: inlineValue("Adventurer's Pack"),
    traits: createCenteredEmptyValue(),
    frontArtworkLayout: 'art-left-text-right',
    frontArtworkText: templateDescriptionParagraphs(
      ['Price', '1 gp, 5 sp'],
      ['Hands', '--'],
      ['Bulk', '1'],
      ['Category', 'adventuring gear']
    ),
    description: [
      paragraph('Starter kit containing the essential items for exploration and survival.'),
      labeledParagraph('Contents', 'Backpack, bedroll, chalk, flint and steel, rope, rations, soap, torches, waterskin.'),
    ],
  }),
}

export default adventuringGearTemplate
