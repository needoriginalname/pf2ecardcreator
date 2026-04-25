import { useEffect, useMemo, useState } from 'react'
import CardFace from './CardFace'
import { getRichTextPlainText } from '../utils/richText.jsx'

const MAX_PRINT_QUANTITY = 99

const getCardLabel = (card) => getRichTextPlainText(card.name) || 'Card'

const clampQuantity = (value) => {
  const nextValue = Number(value)

  if (!Number.isFinite(nextValue)) {
    return 0
  }

  return Math.min(Math.max(Math.floor(nextValue), 0), MAX_PRINT_QUANTITY)
}

const createInitialQuantities = (deck, quantity = 1) =>
  Object.fromEntries(deck.map((card) => [card.id, quantity]))

function PrintModal({ deck, onCancel, onConfirm }) {
  const [quantities, setQuantities] = useState(() => createInitialQuantities(deck))

  useEffect(() => {
    setQuantities(createInitialQuantities(deck))
  }, [deck])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  const totalCopies = useMemo(
    () => deck.reduce((sum, card) => sum + (quantities[card.id] ?? 0), 0),
    [deck, quantities]
  )
  const selectedCards = useMemo(
    () => deck.reduce((sum, card) => sum + ((quantities[card.id] ?? 0) > 0 ? 1 : 0), 0),
    [deck, quantities]
  )

  const updateQuantity = (cardId, nextValue) => {
    setQuantities((prev) => ({
      ...prev,
      [cardId]: clampQuantity(nextValue),
    }))
  }

  const setAllQuantities = (nextValue) => {
    setQuantities(createInitialQuantities(deck, clampQuantity(nextValue)))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (totalCopies === 0) {
      alert('Choose at least one card copy to print.')
      return
    }

    onConfirm(quantities)
  }

  return (
    <div className="print-modal" role="presentation" onClick={onCancel}>
      <div
        className="print-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <form className="print-modal-content" onSubmit={handleSubmit}>
          <div className="print-modal-header">
            <div>
              <h3 id="print-modal-title">Choose Cards to Print</h3>
              <p className="print-modal-hint">
                Set how many copies you want for each card in your deck.
              </p>
            </div>
            <button type="button" className="print-modal-close" onClick={onCancel}>
              Close
            </button>
          </div>

          <div className="print-modal-toolbar">
            <button type="button" onClick={() => setAllQuantities(1)}>
              Set All to 1
            </button>
            <button type="button" onClick={() => setAllQuantities(0)}>
              Clear All
            </button>
            <p className="print-modal-summary">
              {selectedCards} card{selectedCards === 1 ? '' : 's'} selected, {totalCopies} total
              cop{totalCopies === 1 ? 'y' : 'ies'}
            </p>
          </div>

          <div className="print-selection-list">
            {deck.map((card, index) => {
              const quantity = quantities[card.id] ?? 0
              const cardName = getCardLabel(card)

              return (
                <article key={card.id} className="print-selection-card">
                  <div className="print-selection-preview">
                    <article className="card-preview small">
                      <CardFace card={card} imageAlt={`${cardName} art`} reserveEmptyArtworkSpace />
                    </article>
                  </div>

                  <div className="print-selection-details">
                    <p className="print-selection-index">Card {index + 1}</p>
                    <h4>{cardName}</h4>
                    <label className="print-quantity-field">
                      Copies to print
                      <div className="print-quantity-controls">
                        <button
                          type="button"
                          aria-label={`Decrease copies for ${cardName}`}
                          onClick={() => updateQuantity(card.id, quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={String(MAX_PRINT_QUANTITY)}
                          value={quantity}
                          onChange={(event) => updateQuantity(card.id, event.target.value)}
                        />
                        <button
                          type="button"
                          aria-label={`Increase copies for ${cardName}`}
                          onClick={() => updateQuantity(card.id, quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </label>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="print-modal-actions">
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" disabled={totalCopies === 0}>
              Print Selected Cards
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PrintModal
