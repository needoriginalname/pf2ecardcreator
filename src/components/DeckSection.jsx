import CardBack from './CardBack'
import CardFace from './CardFace'

const BASE_CARD_WIDTH_IN = 2.48
const BASE_CARD_HEIGHT_IN = 3.46
const PRINTABLE_WIDTH_IN = 7.77
const PRINTABLE_HEIGHT_IN = 10.5
const PRINT_GAP_IN = 0.08

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
  const cardWidth =
    (PRINTABLE_WIDTH_IN - PRINT_GAP_IN * (columns - 1)) / columns
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

function DeckSection({
  deck,
  cardCount,
  cardsPerRow,
  mailto,
  onCardsPerRowChange,
  onPrint,
}) {
  const safeCardsPerRow = Math.min(Math.max(cardsPerRow, 1), 8)
  const printLayout = getPrintLayout(safeCardsPerRow)
  const frontPrintPages = chunkCards(deck, printLayout.pageSize).map((page) =>
    padPage(page, printLayout.pageSize)
  )
  const backPrintPages = frontPrintPages.map((page) =>
    mirrorPageForBackPrint(page, printLayout.columns)
  )
  const hasAnyBacks = deck.some((card) => card.imageBack)

  return (
    <section className="deck-section" aria-label="Deck controls">
      <h2>Deck ({cardCount})</h2>
      <div className="deck-actions">
        <button type="button" onClick={onPrint}>
          Print deck
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

      <div
        className="deck-grid screen-deck-grid"
        style={{ '--cards-per-row': safeCardsPerRow }}
      >
        {deck.map((card) => (
          <article key={card.id} className="card-preview small">
            <CardFace card={card} imageAlt={`${card.name} art`} />
          </article>
        ))}
        {deck.length === 0 && <p className="empty">No cards in deck yet.</p>}
      </div>

      <div className="print-pages" aria-hidden="true">
        {frontPrintPages.map((page, pageIndex) => (
          <div key={`front-page-${pageIndex}`} className="print-page print-page-front">
            <div
              className="deck-grid print-deck-grid"
              style={{
                '--print-columns': printLayout.columns,
                '--print-card-width': `${printLayout.cardWidth}in`,
                '--print-card-height': `${printLayout.cardHeight}in`,
                '--print-card-scale': printLayout.scale,
              }}
            >
              {page.map((card, slotIndex) =>
                card ? (
                  <article key={card.id} className="card-preview small">
                    <CardFace card={card} imageAlt={`${card.name} art`} />
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
              <div
                className="deck-grid print-deck-grid"
                style={{
                  '--print-columns': printLayout.columns,
                  '--print-card-width': `${printLayout.cardWidth}in`,
                  '--print-card-height': `${printLayout.cardHeight}in`,
                  '--print-card-scale': printLayout.scale,
                }}
              >
                {page.map((card, slotIndex) =>
                  card ? (
                    <article key={`${card.id}-back`} className="card-preview small">
                      <CardBack image={card.imageBack} alt={`${card.name} back`} emptyLabel="" />
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
