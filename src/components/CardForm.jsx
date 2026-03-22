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

      <details className="layout-panel" open>
        <summary>Card Layout</summary>

        <div className="layout-grid">
          <div className="form-field">
            <span className="field-label">Border thickness ({card.borderThickness}px)</span>
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={card.borderThickness}
              onChange={onChange('borderThickness')}
            />
          </div>

          <div className="form-field">
            <span className="field-label">Border color</span>
            <input type="color" value={card.borderColor} onChange={onChange('borderColor')} />
          </div>

          <div className="form-field">
            <span className="field-label">Description box color</span>
            <input
              type="color"
              value={card.descriptionBoxColor}
              onChange={onChange('descriptionBoxColor')}
            />
          </div>

          <div className="form-field">
            <span className="field-label">
              Description box transparency ({Math.round(card.descriptionBoxOpacity * 100)}%)
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={card.descriptionBoxOpacity}
              onChange={onChange('descriptionBoxOpacity')}
            />
          </div>
        </div>

        <div className="layout-grid">
          <div className="form-field">
            <span className="field-label">Front background mode</span>
            <select value={card.frontBackgroundMode} onChange={onChange('frontBackgroundMode')}>
              <option value="solid">Solid color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Custom image</option>
            </select>
          </div>

          <div className="form-field">
            <span className="field-label">Front background primary</span>
            <input
              type="color"
              value={card.frontBackgroundColor}
              onChange={onChange('frontBackgroundColor')}
            />
          </div>

          <div className="form-field">
            <span className="field-label">Front background secondary</span>
            <input
              type="color"
              value={card.frontBackgroundSecondaryColor}
              onChange={onChange('frontBackgroundSecondaryColor')}
            />
          </div>

          <div className="form-field">
            <span className="field-label">Front background image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onImageChange(event, 'frontBackground')}
            />
          </div>
        </div>

        <div className="layout-grid">
          <div className="form-field">
            <span className="field-label">Back background mode</span>
            <select value={card.backBackgroundMode} onChange={onChange('backBackgroundMode')}>
              <option value="solid">Solid color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Use back artwork</option>
            </select>
          </div>

          <div className="form-field">
            <span className="field-label">Back background primary</span>
            <input
              type="color"
              value={card.backBackgroundColor}
              onChange={onChange('backBackgroundColor')}
            />
          </div>

          <div className="form-field">
            <span className="field-label">Back background secondary</span>
            <input
              type="color"
              value={card.backBackgroundSecondaryColor}
              onChange={onChange('backBackgroundSecondaryColor')}
            />
          </div>

          <div className="form-field">
            <span className="field-label">Back background image</span>
            <input
              id="card-back-artwork"
              type="file"
              accept="image/*"
              onChange={(event) => onImageChange(event, 'back')}
            />
          </div>
        </div>
      </details>

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
