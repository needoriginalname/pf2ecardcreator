import { getRichTextPlainText } from './richText.jsx'

export const getCardSummary = (card) => {
  const name = getRichTextPlainText(card.name)
  if (!name) return 'Add a card name to see the preview'
  return name
}
