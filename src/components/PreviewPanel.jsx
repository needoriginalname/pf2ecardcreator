import CardBack from './CardBack'
import CardFace from './CardFace'

function PreviewPanel({ card, summary, previewBack, setPreviewBack }) {
  return (
    <aside className="preview-panel" aria-label="Card preview">
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

      <article className="card-preview" role="region" aria-live="polite">
        {previewBack ? <CardBack card={card} /> : <CardFace card={card} />}
      </article>
    </aside>
  )
}

export default PreviewPanel
