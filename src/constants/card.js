import { createEmptyRichTextValue } from '../utils/richText.jsx'

export const createInitialCard = () => ({
  type: 'Spell',
  name: createEmptyRichTextValue(),
  level: '1',
  rarity: 'Common',
  traits: createEmptyRichTextValue(),
  actionIcon: 'A',
  actionCustom: createEmptyRichTextValue(),
  school: 'Evocation',
  description: createEmptyRichTextValue(),
  details: '',
  image: '',
  imageBack: '',
})
