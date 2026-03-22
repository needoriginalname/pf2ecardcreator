import { getCardSurfaceStyle } from '../utils/cardLayout'

function CardBack({ card, alt = 'Card back', emptyLabel = 'No back image' }) {
  const showImage = card.backBackgroundMode === 'image' && card.imageBack
  const showPlaceholder = card.backBackgroundMode === 'image' && !card.imageBack && emptyLabel

  return (
    <div className="mtg-card mtg-card-back" style={getCardSurfaceStyle(card, 'back')}>
      {showPlaceholder ? (
        <div className="mtg-image mtg-image-back">
          <div className="mtg-image-empty">{emptyLabel}</div>
        </div>
      ) : null}
      {showImage ? <img className="mtg-back-image" src={card.imageBack} alt={alt} /> : null}
    </div>
  )
}

export default CardBack
