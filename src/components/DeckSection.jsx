import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MdDelete,
  MdEdit,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md'
import CardBack from './CardBack'
import CardFace from './CardFace'
import { getRichTextPlainText } from '../utils/richText.jsx'
import { hasCustomBackLayout } from '../utils/cardLayout'

const BASE_CARD_WIDTH_IN = 2.48
const BASE_CARD_HEIGHT_IN = 3.46
const BASE_CARD_WIDTH_PX = BASE_CARD_WIDTH_IN * 96
const PRINTABLE_WIDTH_IN = 7.77
const PRINTABLE_HEIGHT_IN = 10.5
const PRINT_GAP_IN = 0.08
const SCREEN_GAP_PX = 12
const LONG_PRESS_MS = 350

const chunkCards = (cards, pageSize) => {
  const pages = []

  for (let index = 0; index < cards.length; index += pageSize) {
    pages.push(cards.slice(index, index + pageSize))
  }

  return pages
}

const padPage = (page, pageSize) => [
  ...page,
  ...Array.from({ length: pageSize - page.length }, () => null),
]

const mirrorPageForBackPrint = (page, columns) => {
  const mirrored = []

  for (let index = 0; index < page.length; index += columns) {
    mirrored.push(...page.slice(index, index + columns).reverse())
  }

  return mirrored
}

const getPrintLayout = (columns) => {
  const cardWidth = (PRINTABLE_WIDTH_IN - PRINT_GAP_IN * (columns - 1)) / columns
  const cardHeight = cardWidth * (BASE_CARD_HEIGHT_IN / BASE_CARD_WIDTH_IN)
  const rows = Math.max(
    1,
    Math.floor((PRINTABLE_HEIGHT_IN + PRINT_GAP_IN) / (cardHeight + PRINT_GAP_IN))
  )

  return {
    columns,
    rows,
    pageSize: columns * rows,
    cardWidth,
    cardHeight,
    scale: cardWidth / BASE_CARD_WIDTH_IN,
  }
}

const getScreenCardScale = (cardWidthPx) =>
  cardWidthPx > 0 ? cardWidthPx / BASE_CARD_WIDTH_PX : 1

const getPrintGridStyle = (printLayout) => {
  return {
    '--print-columns': printLayout.columns,
    '--print-card-width': `${printLayout.cardWidth}in`,
    '--print-card-height': `${printLayout.cardHeight}in`,
    '--print-card-font-scale': printLayout.scale,
  }
}

const getCardLabel = (card) => getRichTextPlainText(card.name) || 'Card'

function DeckCardSlot({
  card,
  index,
  isControlsVisible,
  isDragging,
  onDelete,
  onDuplicateBefore,
  onDuplicateAfter,
  onEdit,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
}) {
  const cardName = getCardLabel(card)

  return (
    <article
      className={`card-preview small deck-card-slot ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={() => onDragStart(card.id)}
      onDragEnd={onDragEnd}
      onDragOver={(event) => onDragOver(event, index)}
      onDrop={() => onDrop(index)}
      onPointerEnter={() => onPointerEnter(card.id)}
      onPointerLeave={onPointerLeave}
      onPointerDown={() => onPointerDown(card.id)}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className={`deck-card-controls ${isControlsVisible ? 'visible' : ''}`}>
        <button
          type="button"
          className="deck-card-control"
          aria-label="Copy to slot before"
          title="Copy to slot before"
          onClick={() => onDuplicateBefore(index)}
        >
          <MdKeyboardDoubleArrowLeft />
        </button>
        <button
          type="button"
          className="deck-card-control"
          aria-label="Edit card"
          title="Edit card"
          onClick={() => onEdit(card.id)}
        >
          <MdEdit />
        </button>
        <button
          type="button"
          className="deck-card-control danger"
          aria-label="Delete card"
          title="Delete card"
          onClick={() => onDelete(card.id)}
        >
          <MdDelete />
        </button>
        <button
          type="button"
          className="deck-card-control"
          aria-label="Copy to slot after"
          title="Copy to slot after"
          onClick={() => onDuplicateAfter(index)}
        >
          <MdKeyboardDoubleArrowRight />
        </button>
      </div>

      <CardFace card={card} imageAlt={`${cardName} art`} reserveEmptyArtworkSpace />
    </article>
  )
}

function DeckSection({
  deck,
  cardCount,
  cardsPerRow,
  mailto,
  onCardsPerRowChange,
  onClearDeck,
  onPrint,
  onDeleteCard,
  onDuplicateCard,
  onEditCard,
  onMoveCard,
}) {
  const [activeControlsCardId, setActiveControlsCardId] = useState(null)
  const [draggedCardId, setDraggedCardId] = useState(null)
  const [screenCardWidth, setScreenCardWidth] = useState(0)
  const longPressRef = useRef(null)
  const deckGridRef = useRef(null)
  const safeCardsPerRow = Math.min(Math.max(cardsPerRow, 1), 8)
  const printLayout = useMemo(() => getPrintLayout(safeCardsPerRow), [safeCardsPerRow])
  const printGridStyle = useMemo(() => getPrintGridStyle(printLayout), [printLayout])
  const deckGridStyle = useMemo(
    () => ({
      '--cards-per-row': safeCardsPerRow,
      '--screen-card-width': `${screenCardWidth}px`,
      '--screen-card-font-scale': getScreenCardScale(screenCardWidth),
    }),
    [safeCardsPerRow, screenCardWidth]
  )

  useEffect(() => {
    return () => {
      if (longPressRef.current) {
        clearTimeout(longPressRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !deckGridRef.current) {
      return undefined
    }

    const observer = new ResizeObserver((entries) => {
      const gridWidth = entries[0]?.contentRect.width ?? 0
      const responsiveWidth =
        safeCardsPerRow > 0
          ? (gridWidth - SCREEN_GAP_PX * Math.max(safeCardsPerRow - 1, 0)) / safeCardsPerRow
          : 0
      const printCardWidthPx = printLayout.cardWidth * 96
      const nextWidth =
        responsiveWidth >= printCardWidthPx ? printCardWidthPx : responsiveWidth

      setScreenCardWidth(Math.max(0, nextWidth))
    })

    observer.observe(deckGridRef.current)

    return () => {
      observer.disconnect()
    }
  }, [printLayout.cardWidth, safeCardsPerRow])

  const frontPrintPages = useMemo(
    () =>
      chunkCards(deck, printLayout.pageSize).map((page) => padPage(page, printLayout.pageSize)),
    [deck, printLayout.pageSize]
  )
  const backPrintPages = useMemo(
    () => frontPrintPages.map((page) => mirrorPageForBackPrint(page, printLayout.columns)),
    [frontPrintPages, printLayout.columns]
  )
  const hasAnyBacks = deck.some(hasCustomBackLayout)

  const clearLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  const handlePointerDown = (cardId) => {
    clearLongPress()
    longPressRef.current = setTimeout(() => {
      setActiveControlsCardId(cardId)
    }, LONG_PRESS_MS)
  }

  const handlePointerUp = () => {
    clearLongPress()
  }

  const handleDragStart = (cardId) => {
    setDraggedCardId(cardId)
    setActiveControlsCardId(cardId)
  }

  const handleDragEnd = () => {
    setDraggedCardId(null)
  }

  return (
    <section className="deck-section" aria-label="Deck controls">
      <h2>Deck ({cardCount})</h2>
      <div className="deck-actions">
        <button type="button" onClick={onPrint}>
          Print deck
        </button>
        <button type="button" onClick={onClearDeck}>
          Clear Deck
        </button>
        <a className="button" href={mailto}>
          Share as email
        </a>
        <label className="cards-per-row-control">
          Cards per row
          <select
            value={safeCardsPerRow}
            onChange={(event) => onCardsPerRowChange(Number(event.target.value))}
          >
            {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div ref={deckGridRef} className="deck-grid screen-deck-grid" style={deckGridStyle}>
        {deck.map((card, index) => (
          <DeckCardSlot
            key={card.id}
            card={card}
            index={index}
            isControlsVisible={activeControlsCardId === card.id}
            isDragging={draggedCardId === card.id}
            onDelete={onDeleteCard}
            onDuplicateBefore={(slotIndex) => onDuplicateCard(slotIndex, 'before')}
            onDuplicateAfter={(slotIndex) => onDuplicateCard(slotIndex, 'after')}
            onEdit={onEditCard}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(event, slotIndex) => {
              event.preventDefault()
              if (draggedCardId) {
                setActiveControlsCardId(deck[slotIndex]?.id ?? null)
              }
            }}
            onDrop={(slotIndex) => {
              if (draggedCardId) {
                onMoveCard(draggedCardId, slotIndex)
              }
              handleDragEnd()
            }}
            onPointerEnter={setActiveControlsCardId}
            onPointerLeave={() => {
              if (!draggedCardId) {
                setActiveControlsCardId(null)
              }
              clearLongPress()
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        ))}
        {deck.length === 0 && <p className="empty">No cards in deck yet.</p>}
      </div>

      <div className="print-pages" aria-hidden="true">
        {frontPrintPages.map((page, pageIndex) => (
          <div key={`front-page-${pageIndex}`} className="print-page print-page-front">
            <div className="deck-grid print-deck-grid" style={printGridStyle}>
              {page.map((card, slotIndex) =>
                card ? (
                  <article key={card.id} className="card-preview small">
                    <CardFace
                      card={card}
                      imageAlt={`${getCardLabel(card)} art`}
                      reserveEmptyArtworkSpace
                    />
                  </article>
                ) : (
                  <article
                    key={`front-empty-${pageIndex}-${slotIndex}`}
                    className="card-preview small print-slot-empty"
                  />
                )
              )}
            </div>
          </div>
        ))}

        {hasAnyBacks &&
          backPrintPages.map((page, pageIndex) => (
            <div key={`back-page-${pageIndex}`} className="print-page print-page-back">
              <div className="deck-grid print-deck-grid" style={printGridStyle}>
                {page.map((card, slotIndex) =>
                  card ? (
                    <article key={`${card.id}-back`} className="card-preview small">
                      <CardBack card={card} alt={`${getCardLabel(card)} back`} emptyLabel="" />
                    </article>
                  ) : (
                    <article
                      key={`back-empty-${pageIndex}-${slotIndex}`}
                      className="card-preview small print-slot-empty"
                    />
                  )
                )}
              </div>
            </div>
          ))}
      </div>
    </section>
  )
}

export default DeckSection
