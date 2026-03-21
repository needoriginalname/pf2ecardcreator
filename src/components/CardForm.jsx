function CardForm({
  card,
  onChange,
  onImageChange,
  onSubmit,
  onClearDeck,
}) {
  return (
    <form className="card-form" onSubmit={onSubmit} aria-label="Card editor">
      {/* <label>
        Card type
        <select value={card.type} onChange={onChange('type')}>
          <option>Spell</option>
          <option>Item</option>
          <option>Monster</option>
          <option>Feat</option>
          <option>Other</option>
        </select>
      </label> */}

      <label>
        Name
        <input value={card.name} onChange={onChange('name')} placeholder="Fireball" required />
      </label>

      <label>
        Artwork
        <input type="file" accept="image/*" onChange={(event) => onImageChange(event, 'front')} />
      </label>

      <label>
        Back Artwork (optional)
        <input type="file" accept="image/*" onChange={(event) => onImageChange(event, 'back')} />
      </label>

      {/* <div className="row-gap">
        <label>
          Level
          <input
            type="number"
            min="0"
            max="20"
            value={card.level}
            onChange={onChange('level')}
          />
        </label>
        <label>
          Rarity
          <select value={card.rarity} onChange={onChange('rarity')}>
            <option>Common</option>
            <option>Uncommon</option>
            <option>Rare</option>
            <option>Unique</option>
          </select>
        </label>
      </div> */}

      <label>
        Traits (comma-separated)
        <input
          value={card.traits}
          onChange={onChange('traits')}
          placeholder="Evocation, Fire"
        />
      </label>

      <label>
        Action symbol (font icon):
        <select value={card.actionIcon} onChange={onChange('actionIcon')}>
          <option value="">None</option>
          <option value="A">A (one action)</option>
          <option value="D">D (two actions)</option>
          <option value="T">T (three actions)</option>
          <option value="R">R (reaction)</option>
          <option value="F">F (free action)</option>
        </select>
      </label>

      <label>
        Custom action text
        <input
          value={card.actionCustom}
          onChange={onChange('actionCustom')}
          placeholder="e.g. 1 action, Immediate"
          disabled={!!card.actionIcon}
        />
      </label>

      <label>
        School / Category
        <input value={card.school} onChange={onChange('school')} placeholder="Evocation" />
      </label>

      <label>
        Description
        <textarea
          value={card.description}
          onChange={onChange('description')}
          rows="4"
          placeholder="Effect text"
          wrap="soft"
        />
      </label>

      {/* <label>
        Details
        <textarea
          value={card.details}
          onChange={onChange('details')}
          rows="3"
          placeholder="Range, Duration, Damage"
        />
      </label> */}

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
