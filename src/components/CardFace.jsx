import { getActionDisplay } from '../utils/cardDisplay'

function CardFace({ card, imageAlt = 'Card art' }) {
  return (
    <div className="mtg-card">
      <div className="mtg-heading">
        <div className="mtg-name">{card.name || 'Name Here'}</div>
        <div className={`mtg-level ${card.actionCustom?.trim() ? 'custom' : 'icon'}`}>
          {getActionDisplay(card)}
        </div>
      </div>
      <div className="mtg-image">
        {card.image ? (
          <img src={card.image} alt={imageAlt} />
        ) : (
          <div className="mtg-image-empty">Upload an image</div>
        )}
      </div>
      <div className="mtg-traits">{card.traits || 'Traits...'}</div>
      <div className="mtg-body">
        <p>{card.description || 'Main effect text...'}</p>
        {/* <p>{card.details || 'Range, duration, damage, etc.'}</p> */}
      </div>
    </div>
  )
}

export default CardFace
