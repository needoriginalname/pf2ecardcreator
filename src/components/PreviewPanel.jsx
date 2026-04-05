import { useEffect, useMemo, useRef, useState } from 'react'
import CardBack from './CardBack'
import CardFace from './CardFace'

const BASE_CARD_WIDTH_PX = 2.48 * 96
const PANEL_HORIZONTAL_PADDING_PX = 28

const getScreenCardScale = (cardWidthPx) =>
  cardWidthPx > 0 ? cardWidthPx / BASE_CARD_WIDTH_PX : 1

function PreviewPanel({ card, summary, previewBack, setPreviewBack }) {
  const previewPanelRef = useRef(null)
  const [previewCardWidth, setPreviewCardWidth] = useState(BASE_CARD_WIDTH_PX)

  useEffect(() => {
    if (typeof window === 'undefined' || !previewPanelRef.current) {
      return undefined
    }

    const observer = new ResizeObserver((entries) => {
      const panelWidth = entries[0]?.contentRect.width ?? 0
      setPreviewCardWidth(Math.max(0, panelWidth - PANEL_HORIZONTAL_PADDING_PX))
    })

    observer.observe(previewPanelRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  const previewStyle = useMemo(
    () => ({
      '--preview-card-width': `${previewCardWidth}px`,
      '--screen-card-font-scale': getScreenCardScale(previewCardWidth),
    }),
    [previewCardWidth]
  )

  return (
    <aside ref={previewPanelRef} className="preview-panel" aria-label="Card preview">
      <h2>Live preview</h2>
      <p>{summary}</p>
      <div className="preview-toggle">
        <button
          type="button"
          className={!previewBack ? 'active' : ''}
          onClick={() => setPreviewBack(false)}
        >
          Front
        </button>
        <button
          type="button"
          className={previewBack ? 'active' : ''}
          onClick={() => setPreviewBack(true)}
        >
          Back
        </button>
      </div>

      <div
        className="preview-grid desktop-preview screen-deck-grid"
        style={previewStyle}
        role="region"
        aria-live="polite"
      >
        <article className="card-preview">
          <CardFace card={card} />
        </article>
        <article className="card-preview">
          <CardBack card={card} />
        </article>
      </div>

      <article
        className="card-preview mobile-preview screen-deck-grid"
        style={previewStyle}
        role="region"
        aria-live="polite"
      >
        {previewBack ? <CardBack card={card} /> : <CardFace card={card} />}
      </article>
    </aside>
  )
}

export default PreviewPanel
