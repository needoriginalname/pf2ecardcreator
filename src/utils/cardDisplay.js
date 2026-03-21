export const getActionDisplay = (card) => {

  if (card.actionIcon) return card.actionIcon

  if (card.actionCustom?.trim()) return card.actionCustom.trim()
  return  ''
}

export const getCardSummary = (card) => {
  if (!card.name.trim()) return 'Add a card name to see the preview'
  return `${card.type} • ${card.name} (Lvl ${card.level})`
}
