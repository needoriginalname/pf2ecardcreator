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
  gradientType: 'linear',
  color: '#feffff',
  secondaryColor: '#dce4f0',
}

const getGradientValue = (gradientType, primaryColor, secondaryColor) => {
  switch (gradientType) {
    case 'radial':
      return `radial-gradient(circle at center, ${primaryColor}, ${secondaryColor})`
    case 'top-bottom':
      return `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`
    case 'left-right':
      return `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
    case 'diagonal-reverse':
      return `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`
    case 'conic':
      return `conic-gradient(from 180deg at 50% 50%, ${primaryColor}, ${secondaryColor}, ${primaryColor})`
    case 'linear':
    default:
      return `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
  }
}

export const getCardSurfaceStyle = (card, side = 'front') => {
  const prefix = side === 'back' ? 'backBackground' : 'frontBackground'
  const mode = card[`${prefix}Mode`]
  const gradientType = card[`${prefix}GradientType`] ?? 'linear'
  const primaryColor = card[`${prefix}Color`]
  const secondaryColor = card[`${prefix}SecondaryColor`]
  const imageSrc = side === 'back' ? card.imageBack : card.frontBackgroundImage

  const style = {
    '--card-custom-border-width': `${card.borderThickness}px`,
    '--card-custom-border-color': card.borderColor,
    backgroundColor: primaryColor,
  }

  if (mode === 'gradient') {
    style.backgroundImage = getGradientValue(gradientType, primaryColor, secondaryColor)
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
  card.backBackgroundGradientType !== DEFAULT_BACK_BACKGROUND.gradientType ||
  card.backBackgroundColor !== DEFAULT_BACK_BACKGROUND.color ||
  card.backBackgroundSecondaryColor !== DEFAULT_BACK_BACKGROUND.secondaryColor
