import { MdCardGiftcard, MdChevronRight, MdStyle } from 'react-icons/md'
import heroArt from './assets/hero.png'

export default function HomePage({ onOpenLootGenerator, onOpenPrintableCards }) {
  return (
    <main className="home-shell">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-art" aria-hidden="true">
          <img src={heroArt} alt="" />
        </div>
        <div className="home-hero-copy">
          <p className="home-kicker">PF2e table tools</p>
          <h1 id="home-title">Build what your table needs next.</h1>
          <p>
            A growing workspace for Pathfinder 2e utilities. Start with printable cards,
            then add more tools here as the project expands.
          </p>
        </div>
      </section>

      <section className="tool-section" aria-labelledby="tools-title">
        <div className="section-heading">
          <h2 id="tools-title">Tools</h2>
          <p>Pick a workspace to open.</p>
        </div>

        <div className="tool-grid">
          <button
            type="button"
            className="tool-card tool-card-primary"
            onClick={() => onOpenPrintableCards()}
          >
            <span className="tool-card-icon" aria-hidden="true">
              <MdStyle />
            </span>
            <span className="tool-card-copy">
              <span className="tool-card-title">Printable Card Generator</span>
              <span className="tool-card-description">
                Design spell, item, monster, hazard, and custom cards, then print a deck.
              </span>
            </span>
            <MdChevronRight className="tool-card-arrow" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="tool-card tool-card-primary"
            onClick={() => onOpenLootGenerator()}
          >
            <span className="tool-card-icon" aria-hidden="true">
              <MdCardGiftcard />
            </span>
            <span className="tool-card-copy">
              <span className="tool-card-title">Loot Generator</span>
              <span className="tool-card-description">
                Build treasure parcels for encounters, quests, and party rewards.
              </span>
            </span>
            <MdChevronRight className="tool-card-arrow" aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  )
}
