import {
  getRichTextPlainText,
  isRichTextEmpty,
  renderInlineRichText,
  renderRichText,
} from '../utils/richText.jsx'
import { getCardSurfaceStyle, getDescriptionBoxStyle } from '../utils/cardLayout'

function CardFace({ card, imageAlt = 'Card art', reserveEmptyArtworkSpace = false }) {
  const nameText = getRichTextPlainText(card.name)
  const frontArtworkLayout = card.frontArtworkLayout ?? 'art-only'
  const hidesArtworkButKeepsSpace = frontArtworkLayout === 'hidden-preserve-space'
  const showsArtwork = frontArtworkLayout !== 'hidden' && !hidesArtworkButKeepsSpace
  const isSplitLayout =
    frontArtworkLayout === 'art-left-text-right' || frontArtworkLayout === 'text-left-art-right'
  const artworkIsVisible = Boolean(card.image) && showsArtwork
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
  const emptyArtworkPane = (
    <div className="mtg-media-pane mtg-media-pane-art">
      <div
        className="mtg-image mtg-image-framed mtg-image-empty-space"
        style={{
          ...artworkSlotStyle,
          backgroundColor: 'transparent',
        }}
      />
    </div>
  )
  const artworkPane =
    artworkIsVisible ? (
      <div className="mtg-media-pane mtg-media-pane-art">
        <div className="mtg-image mtg-image-framed" style={artworkSlotStyle}>
          <img src={card.image} alt={imageAlt} />
        </div>
      </div>
    ) : reserveEmptyArtworkSpace ? (
      emptyArtworkPane
    ) : (
      <div className="mtg-media-pane mtg-media-pane-art">
        <div className="mtg-image mtg-image-framed" style={artworkSlotStyle}>
          <div className="mtg-image-empty">Upload an image</div>
        </div>
      </div>
    )
  const artworkTextPane = (
    <div className="mtg-media-pane mtg-media-pane-text">
      <div className="mtg-media-text">
        {isRichTextEmpty(card.frontArtworkText) ? (
          <p>Artwork side text...</p>
        ) : (
          renderRichText(card.frontArtworkText, 'left')
        )}
      </div>
    </div>
  )

  return (
    <div className="mtg-card" style={getCardSurfaceStyle(card, 'front')}>
      <div className="mtg-heading">
        <div className="mtg-name">
          {nameText ? renderInlineRichText(card.name, 'left') : 'Name Here'}
        </div>
        <div className="mtg-level custom">
          {!isRichTextEmpty(card.actionCustom) ? renderInlineRichText(card.actionCustom, 'right') : null}
        </div>
      </div>
      {showsArtwork ? (
        isSplitLayout ? (
          <div className={`mtg-media-split mtg-media-split-${frontArtworkLayout}`}>
            {frontArtworkLayout === 'text-left-art-right' ? artworkTextPane : artworkPane}
            {frontArtworkLayout === 'text-left-art-right' ? artworkPane : artworkTextPane}
          </div>
        ) : (
          <div className="mtg-media-full">{artworkPane}</div>
        )
      ) : hidesArtworkButKeepsSpace ? (
        <div className="mtg-media-full mtg-media-placeholder" aria-hidden="true" />
      ) : null}
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
