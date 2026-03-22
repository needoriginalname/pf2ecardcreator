import { getActionDisplay } from '../utils/cardDisplay'
import { getFontFamily } from '../constants/fonts'

const getTextStyle = (prefix, card) => ({
  color: card[`${prefix}Color`],
  fontFamily: getFontFamily(card[`${prefix}Font`]) === 'inherit' ? undefined : getFontFamily(card[`${prefix}Font`]),
  fontWeight: card[`${prefix}Bold`] ? 700 : 400,
  fontStyle: card[`${prefix}Italic`] ? 'italic' : 'normal',
})

function CardFace({ card, imageAlt = 'Card art' }) {
  const hasCustomActionText = Boolean(card.actionCustom?.trim())

  return (
    <div className="mtg-card">
      <div className="mtg-heading">
        <div className="mtg-name" style={getTextStyle('name', card)}>
          {card.name || 'Name Here'}
        </div>
        <div className={`mtg-level ${card.actionCustom?.trim() ? 'custom' : 'pf2e-action-icon'}`}>
          <span style={hasCustomActionText ? getTextStyle('actionText', card) : undefined}>
            {getActionDisplay(card)}
          </span>
        </div>
      </div>
      <div className="mtg-image">
        {card.image ? (
          <img src={card.image} alt={imageAlt} />
        ) : (
          <div className="mtg-image-empty">Upload an image</div>
        )}
      </div>
      <div className="mtg-traits" style={getTextStyle('traits', card)}>
        {card.traits || 'Traits...'}
      </div>
      <div className="mtg-body">
        <p>{card.description || 'Main effect text...'}</p>
        {/* <p>{card.details || 'Range, duration, damage, etc.'}</p> */}
      </div>
    </div>
  )
}

export default CardFace
