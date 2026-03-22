import { getActionDisplay } from '../utils/cardDisplay'
import {
  getRichTextPlainText,
  isRichTextEmpty,
  renderInlineRichText,
  renderRichText,
} from '../utils/richText.jsx'

function CardFace({ card, imageAlt = 'Card art' }) {
  const hasCustomActionText = !card.actionIcon && !isRichTextEmpty(card.actionCustom)
  const nameText = getRichTextPlainText(card.name)

  return (
    <div className="mtg-card">
      <div className="mtg-heading">
        <div className="mtg-name">
          {nameText ? renderInlineRichText(card.name) : 'Name Here'}
        </div>
        <div className={`mtg-level ${hasCustomActionText ? 'custom' : 'pf2e-action-icon'}`}>
          {hasCustomActionText ? renderInlineRichText(card.actionCustom) : getActionDisplay(card)}
        </div>
      </div>
      <div className="mtg-image">
        {card.image ? (
          <img src={card.image} alt={imageAlt} />
        ) : (
          <div className="mtg-image-empty">Upload an image</div>
        )}
      </div>
      <div className="mtg-traits">
        {isRichTextEmpty(card.traits) ? 'Traits...' : renderInlineRichText(card.traits)}
      </div>
      <div className="mtg-body">
        {isRichTextEmpty(card.description) ? <p>Main effect text...</p> : renderRichText(card.description)}
      </div>
    </div>
  )
}

export default CardFace
