import { getActionDisplay } from '../utils/cardDisplay'
import {
  getRichTextPlainText,
  isRichTextEmpty,
  renderInlineRichText,
  renderRichText,
} from '../utils/richText.jsx'
import { getCardSurfaceStyle, getDescriptionBoxStyle } from '../utils/cardLayout'

function CardFace({ card, imageAlt = 'Card art' }) {
  const hasCustomActionText = !card.actionIcon && !isRichTextEmpty(card.actionCustom)
  const nameText = getRichTextPlainText(card.name)
  const showArtwork = card.showFrontArtwork
  const artworkIsVisible = Boolean(card.image) && showArtwork
  const artworkSlotStyle =
    card.frontArtworkBackgroundMode === 'color'
      ? {
          backgroundColor: card.frontArtworkBackgroundColor,
          borderWidth: `${card.frontArtworkBorderThickness}px`,
          borderColor: card.frontArtworkBorderColor,
        }
      : {
          backgroundColor: 'transparent',
          borderWidth: `${card.frontArtworkBorderThickness}px`,
          borderColor: card.frontArtworkBorderColor,
        }

  return (
    <div className="mtg-card" style={getCardSurfaceStyle(card, 'front')}>
      <div className="mtg-heading">
        <div className="mtg-name">
          {nameText ? renderInlineRichText(card.name, 'left') : 'Name Here'}
        </div>
        <div className={`mtg-level ${hasCustomActionText ? 'custom' : 'pf2e-action-icon'}`}>
          {hasCustomActionText ? renderInlineRichText(card.actionCustom, 'right') : getActionDisplay(card)}
        </div>
      </div>
      <div
        className={`mtg-image${showArtwork ? '' : ' mtg-image-hidden'}`}
        style={showArtwork ? artworkSlotStyle : undefined}
        aria-hidden={!showArtwork}
      >
        {artworkIsVisible ? (
          <img src={card.image} alt={imageAlt} />
        ) : showArtwork ? (
          <div className="mtg-image-empty">Upload an image</div>
        ) : null}
      </div>
      <div className="mtg-traits">
        {isRichTextEmpty(card.traits) ? 'Traits...' : renderInlineRichText(card.traits, 'center')}
      </div>
      <div className="mtg-body" style={getDescriptionBoxStyle(card)}>
        {isRichTextEmpty(card.description) ? <p>Main effect text...</p> : renderRichText(card.description, 'left')}
      </div>
    </div>
  )
}

export default CardFace
