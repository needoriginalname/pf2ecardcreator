import { FONT_OPTIONS } from '../constants/fonts'

function StyleSection({ title, prefix, card, onChange }) {
  return (
    <details className="inline-style-panel">
      <summary>
        <span className="inline-style-title">{title} appearance</span>
      </summary>
      <div className="style-grid">
        <div>
          <span className="field-label">Font color</span>
          <input type="color" value={card[`${prefix}Color`]} onChange={onChange(`${prefix}Color`)} />
        </div>

        <div>
          <span className="field-label">Font</span>
          <input
            type="text"
            list={`${prefix}-font-options`}
            value={card[`${prefix}Font`]}
            onChange={onChange(`${prefix}Font`)}
            placeholder="Search fonts"
          />
          <datalist id={`${prefix}-font-options`}>
            {FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} />
            ))}
          </datalist>
        </div>

        <div className="style-toggle">
          <span>Bold</span>
          <input
            id={`${prefix}-bold`}
            type="checkbox"
            checked={card[`${prefix}Bold`]}
            onChange={onChange(`${prefix}Bold`)}
          />
        </div>

        <div className="style-toggle">
          <span>Italic</span>
          <input
            id={`${prefix}-italic`}
            type="checkbox"
            checked={card[`${prefix}Italic`]}
            onChange={onChange(`${prefix}Italic`)}
          />
        </div>
      </div>
    </details>
  )
}

function CardForm({
  card,
  formId,
  onChange,
  onImageChange,
  onSubmit,
  onClearDeck,
}) {
  return (
    <form id={formId} className="card-form" onSubmit={onSubmit} aria-label="Card editor">
      <div className="form-field">
        <span className="field-label">Name</span>
        <StyleSection title="Name" prefix="name" card={card} onChange={onChange} />
        <input
          id="card-name"
          value={card.name}
          onChange={onChange('name')}
          placeholder="Fireball"
          required
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
        <StyleSection title="Traits" prefix="traits" card={card} onChange={onChange} />
        <input
          id="card-traits"
          value={card.traits}
          onChange={onChange('traits')}
          placeholder="Evocation, Fire"
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
        <StyleSection title="Custom action text" prefix="actionText" card={card} onChange={onChange} />
        <input
          id="card-action-custom"
          value={card.actionCustom}
          onChange={onChange('actionCustom')}
          placeholder="e.g. 1 action, Immediate"
          disabled={!!card.actionIcon}
        />
      </div>

      <div className="form-field">
        <span className="field-label">Description</span>
        <textarea
          id="card-description"
          value={card.description}
          onChange={onChange('description')}
          rows="4"
          placeholder="Effect text"
          wrap="soft"
        />
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
