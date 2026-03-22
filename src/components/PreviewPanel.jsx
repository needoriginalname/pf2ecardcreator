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

      <div className="preview-grid desktop-preview" role="region" aria-live="polite">
        <article className="card-preview">
          <CardFace card={card} />
        </article>
        <article className="card-preview">
          <CardBack card={card} />
        </article>
      </div>

      <article className="card-preview mobile-preview" role="region" aria-live="polite">
        {previewBack ? <CardBack card={card} /> : <CardFace card={card} />}
      </article>
    </aside>
  )
}

export default PreviewPanel
