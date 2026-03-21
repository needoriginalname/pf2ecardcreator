import CardBack from './CardBack'
import CardFace from './CardFace'

const PRINT_COLUMNS = 3
const PRINT_ROWS = 3
const PRINT_PAGE_SIZE = PRINT_COLUMNS * PRINT_ROWS

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

function DeckSection({ deck, cardCount, mailto, onPrint }) {
  const frontPrintPages = chunkCards(deck, PRINT_PAGE_SIZE).map((page) =>
    padPage(page, PRINT_PAGE_SIZE)
  )
  const backPrintPages = frontPrintPages.map((page) =>
    mirrorPageForBackPrint(page, PRINT_COLUMNS)
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
      </div>

      <div className="deck-grid screen-deck-grid">
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
            <div className="deck-grid print-deck-grid">
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
              <div className="deck-grid print-deck-grid">
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
