const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '')
  const safeHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized

  const value = Number.parseInt(safeHex, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

const toRgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const DEFAULT_BACK_BACKGROUND = {
  mode: 'solid',
  color: '#feffff',
  secondaryColor: '#dce4f0',
}

export const getCardSurfaceStyle = (card, side = 'front') => {
  const prefix = side === 'back' ? 'backBackground' : 'frontBackground'
  const mode = card[`${prefix}Mode`]
  const primaryColor = card[`${prefix}Color`]
  const secondaryColor = card[`${prefix}SecondaryColor`]
  const imageSrc = side === 'back' ? card.imageBack : card.frontBackgroundImage

  const style = {
    '--card-custom-border-width': `${card.borderThickness}px`,
    '--card-custom-border-color': card.borderColor,
    backgroundColor: primaryColor,
  }

  if (mode === 'gradient') {
    style.backgroundImage = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
  }

  if (mode === 'image' && imageSrc) {
    style.backgroundImage = `url(${imageSrc})`
    style.backgroundSize = '100% 100%'
    style.backgroundPosition = 'center'
    style.backgroundRepeat = 'no-repeat'
  }

  return style
}

export const getDescriptionBoxStyle = (card) => ({
  '--description-box-bg': toRgba(card.descriptionBoxColor, card.descriptionBoxOpacity),
})

export const hasCustomBackLayout = (card) =>
  Boolean(card.imageBack) ||
  card.backBackgroundMode !== DEFAULT_BACK_BACKGROUND.mode ||
  card.backBackgroundColor !== DEFAULT_BACK_BACKGROUND.color ||
  card.backBackgroundSecondaryColor !== DEFAULT_BACK_BACKGROUND.secondaryColor
