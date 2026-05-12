import { MdArrowBack } from 'react-icons/md'

export default function AboutPage({ onBackHome }) {
  return (
    <main className="meta-page">
      <header className="meta-page-header">
        <button
          type="button"
          className="back-button"
          onClick={onBackHome}
          aria-label="Back to home"
        >
          <MdArrowBack />
          Back
        </button>
        <h1>About NeedOriginalPf2eTools</h1>
      </header>

      <div className="meta-page-content">
        <section>
          <h2>Project Overview</h2>
          <p>
            NeedOriginalPf2eTools is a community-driven web application dedicated to making
            character creation and management for Pathfinder 2nd Edition (PF2e) faster, easier,
            and more enjoyable.
          </p>
        </section>

        <section>
          <h2>What Is Pathfinder 2nd Edition?</h2>
          <p>
            Pathfinder 2nd Edition is a popular tabletop role-playing game (TTRPG) published by
            Paizo. It's known for its balanced mechanics, creative character building options, and
            engaging campaign experiences.
          </p>
        </section>

        <section>
          <h2>Why This Tool?</h2>
          <p>Creating a PF2e character involves:</p>
          <ul>
            <li>Selecting ancestry, background, and class</li>
            <li>Calculating ability scores</li>
            <li>Choosing skills and feats</li>
            <li>Determining hit points and saving throws</li>
            <li>And much more!</li>
          </ul>
          <p>
            While the official resources are comprehensive, the process can be time-consuming,
            especially for new players. NeedOriginalPf2eTools streamlines this process by
            providing an intuitive interface, automated calculations, quick reference guides, and
            exportable character sheets.
          </p>
        </section>

        <section>
          <h2>Our Mission</h2>
          <p>
            To create the best free, open-source tool for PF2e character creation that helps
            players of all experience levels enjoy the game more.
          </p>
        </section>

        <section>
          <h2>Key Features</h2>
          <ul>
            <li>
              <strong>Intuitive Interface</strong> - Easy to navigate for newcomers
            </li>
            <li>
              <strong>Fast</strong> - Built with modern web technologies for quick loading and
              responsiveness
            </li>
            <li>
              <strong>Privacy-Focused</strong> - Your character data stays on your device
            </li>
            <li>
              <strong>Responsive Design</strong> - Works on desktop, tablet, and mobile
            </li>
            <li>
              <strong>Customizable</strong> - Export and customize your character cards
            </li>
          </ul>
        </section>

        <section>
          <h2>Technical Details</h2>
          <p>NeedOriginalPf2eTools is built as a web application using:</p>
          <ul>
            <li>
              <strong>React</strong> - A modern JavaScript library for building user interfaces
            </li>
            <li>
              <strong>Vite</strong> - A fast and efficient build tool
            </li>
            <li>
              <strong>Pure JavaScript</strong> - No unnecessary dependencies
            </li>
          </ul>
        </section>

        <section>
          <h2>Get Involved</h2>
          <p>
            We're always looking for feedback and contributions! Whether you want to report bugs,
            suggest features, or contribute code, please reach out via email or check out our
            support page.
          </p>
        </section>
      </div>
    </main>
  )
}
