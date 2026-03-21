import CardBack from './CardBack'
import CardFace from './CardFace'

function PreviewPanel({ card, summary, previewBack, setPreviewBack }) {
  return (
    <aside className="preview-panel" aria-label="Card preview">
      <h2>Live preview</h2>
      <p>{summary}</p>

      <article className="card-preview" role="region" aria-live="polite">
        <CardFace card={card} />

        {card.imageBack && <CardBack image={card.imageBack} />}
      </article>
    </aside>
  )
}

export default PreviewPanel
