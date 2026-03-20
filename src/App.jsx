import { useMemo, useState } from 'react'
import './App.css'

const initialCard = {
  type: 'Spell',
  name: '',
  level: '1',
  rarity: 'Common',
  traits: '',
  actionIcon: 'A',
  actionCustom: '',
  school: 'Evocation',
  description: '',
  details: '',
  image: '',
}

function App() {
  const [card, setCard] = useState(initialCard)
  const [deck, setDeck] = useState([])

  const cardCount = deck.length

  const summary = useMemo(() => {
    if (!card.name.trim()) return 'Add a card name to see the preview'
    return `${card.type} • ${card.name} (Lvl ${card.level})`
  }, [card])

  const onChange = (field) => (event) => {
    const value = event.target.value
    setCard((prev) => ({ ...prev, [field]: value }))
  }

  const onImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCard((prev) => ({ ...prev, image: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const actionDisplay = () => {
    if (card.actionCustom?.trim()) return card.actionCustom.trim()
    return card.actionIcon || ''
  }

  const addCard = () => {
    if (!card.name.trim()) return
    setDeck((prev) => [...prev, { ...card, id: Date.now() }])
    setCard(initialCard)
  }

  const clearDeck = () => setDeck([])

  const handlePrint = () => {
    if (!deck.length) {
      alert('Please add at least one card to the deck before printing.')
      return
    }
    window.print()
  }

  const mailto = `mailto:?subject=PF2e card deck&body=${encodeURIComponent(
    `Hey,%0A%0Acheck out my PF2e cards:%0A${deck
      .map((c) => `${c.type}: ${c.name} (Lvl ${c.level})`)
      .join('%0A')}`
  )}`

  return (
    <main className="app-shell">
      <header className="top-bar">
        <h1>PF2e Card Designer</h1>
        <p>Design spell/item/monster cards and print locally.</p>
      </header>

      <section className="builder-grid">
        <form
          className="card-form"
          onSubmit={(e) => {
            e.preventDefault()
            addCard()
          }}
          aria-label="Card editor"
        >
          <label>
            Card type
            <select value={card.type} onChange={onChange('type')}>
              <option>Spell</option>
              <option>Item</option>
              <option>Monster</option>
              <option>Feat</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Name
            <input
              value={card.name}
              onChange={onChange('name')}
              placeholder="Fireball"
              required
            />
          </label>

          <label>
            Artwork
            <input type="file" accept="image/*" onChange={onImageChange} />
          </label>

          <div className="row-gap">
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
          </div>

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
            />
          </label>

          <label>
            Details
            <textarea
              value={card.details}
              onChange={onChange('details')}
              rows="3"
              placeholder="Range, Duration, Damage"
            />
          </label>

          <div className="form-actions">
            <button type="submit">Add Card to Deck</button>
            <button type="button" onClick={clearDeck}>Clear Deck</button>
          </div>
        </form>

        <aside className="preview-panel" aria-label="Card preview">
          <h2>Live preview</h2>
          <p>{summary}</p>
          <article className="card-preview" role="region" aria-live="polite">
            <div className="mtg-card">
              <div className="mtg-heading">
                <div className="mtg-name">{card.name || 'Name Here'}</div>
                <div className={`mtg-level ${card.actionCustom?.trim() ? 'custom' : 'icon'}`}>
                  {actionDisplay()}
                </div>
              </div>
              <div className="mtg-image">
                {card.image ? (
                  <img src={card.image} alt="Card art" />
                ) : (
                  <div className="mtg-image-empty">Upload an image</div>
                )}
              </div>
              <div className="mtg-traits">{card.traits || 'Traits...'}</div>
              <div className="mtg-body">
                <p>{card.description || 'Main effect text...'}</p>
                <p>{card.details || 'Range, duration, damage, etc.'}</p>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section className="deck-section" aria-label="Deck controls">
        <h2>Deck ({cardCount})</h2>
        <div className="deck-actions">
          <button type="button" onClick={handlePrint}>Print deck</button>
          <a className="button" href={mailto}>Share as email</a>
        </div>

        <div className="deck-grid">
          {deck.map((c) => (
            <article key={c.id} className="card-preview small mtg-card">
              <div className="mtg-heading">
                <div className="mtg-name">{c.name}</div>
                <div className={`mtg-level ${c.actionCustom?.trim() ? 'custom' : 'icon'}`}>
                  {c.actionCustom?.trim() ? c.actionCustom : c.actionIcon}
                </div>
              </div>
              <div className="mtg-image">
                {c.image ? <img src={c.image} alt={`${c.name} art`} /> : <div className="mtg-image-empty">No image</div>}
              </div>
              <div className="mtg-traits">{c.traits || 'Traits...'}</div>
              <div className="mtg-body">
                <p>{c.description || 'Main effect text...'}</p>
                <p>{c.details || 'Range, duration, damage, etc.'}</p>
              </div>
            </article>
          ))}
          {deck.length === 0 && <p className="empty">No cards in deck yet.</p>}
        </div>
      </section>

      <footer className="note">
        Tip: For best results, print from Chrome/Edge using A4 or Letter landscape and 3mm margins.
      </footer>
    </main>
  )
}

export default App
