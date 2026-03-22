import { getRichTextPlainText } from './richText.jsx'

export const getActionDisplay = (card) => {
  if (card.actionIcon) return card.actionIcon
  return getRichTextPlainText(card.actionCustom)
}

export const getCardSummary = (card) => {
  const name = getRichTextPlainText(card.name)
  if (!name) return 'Add a card name to see the preview'
  return `${card.type} - ${name} (Lvl ${card.level})`
}
