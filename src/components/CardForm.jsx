import RichTextEditor from './RichTextEditor'

function CardForm({
  card,
  formId,
  onActionTextChange,
  onChange,
  onDescriptionChange,
  onImageChange,
  onNameChange,
  onSubmit,
  onTraitsChange,
  onClearDeck,
}) {
  return (
    <form id={formId} className="card-form" onSubmit={onSubmit} aria-label="Card editor">
      <div className="form-field">
        <span className="field-label">Name</span>
        <RichTextEditor
          value={card.name}
          onChange={onNameChange}
          placeholder="Fireball"
          compact
          singleLine
        />
      </div>

      <div className="form-field">
        <span className="field-label">Artwork</span>
        <input
          id="card-artwork"
          type="file"
          accept="image/*"
          onChange={(event) => onImageChange(event, 'front')}
        />
      </div>

      <div className="form-field">
        <span className="field-label">Back Artwork (optional)</span>
        <input
          id="card-back-artwork"
          type="file"
          accept="image/*"
          onChange={(event) => onImageChange(event, 'back')}
        />
      </div>

      <div className="form-field">
        <span className="field-label">Traits</span>
        <RichTextEditor
          value={card.traits}
          onChange={onTraitsChange}
          placeholder="Evocation, Fire"
          compact
          singleLine
        />
      </div>

      <div className="form-field">
        <span className="field-label">Action symbol:</span>
        <select id="card-action-icon" value={card.actionIcon} onChange={onChange('actionIcon')}>
          <option value="">None</option>
          <option value="A">One action</option>
          <option value="D">Two actions</option>
          <option value="T">Three actions</option>
          <option value="R">Reaction</option>
          <option value="F">Free action</option>
        </select>
      </div>

      <div className="form-field">
        <span className="field-label">Custom action text</span>
        <RichTextEditor
          value={card.actionCustom}
          onChange={onActionTextChange}
          placeholder="e.g. 1 action, Immediate"
          compact
          singleLine
        />
      </div>

      <div className="form-field">
        <span className="field-label">Description</span>
        <RichTextEditor value={card.description} onChange={onDescriptionChange} placeholder="Effect text" />
      </div>

      <div className="form-actions">
        <button type="submit">Add Card to Deck</button>
        <button type="button" onClick={onClearDeck}>
          Clear Deck
        </button>
      </div>
    </form>
  )
}

export default CardForm
