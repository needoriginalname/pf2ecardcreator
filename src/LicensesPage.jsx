import { MdArrowBack } from 'react-icons/md'

export default function LicensesPage({ onBackHome }) {
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
        <h1>Licenses & Attribution</h1>
      </header>

      <div className="meta-page-content">
        <section>
          <h2>NeedOriginalPf2eTools License</h2>
          <p>
            NeedOriginalPf2eTools is released under the <strong>MIT License</strong>, which allows
            you to freely use, modify, and distribute this software for personal and commercial
            purposes, provided you include the license notice.
          </p>
          <p>
            For the full license text, see the LICENSE file in our{' '}
            <a href="https://github.com/needoriginalname/pf2ecardcreator" target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Open Source Dependencies</h2>
          <p>
            NeedOriginalPf2eTools is built on the shoulders of open source projects. We're grateful
            to the maintainers of:
          </p>
          <ul>
            <li>
              <strong>React</strong> - Licensed under MIT
              <br />
              <a
                href="https://github.com/facebook/react"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://github.com/facebook/react
              </a>
            </li>
            <li>
              <strong>Vite</strong> - Licensed under MIT
              <br />
              <a href="https://github.com/vitejs/vite" target="_blank" rel="noopener noreferrer">
                https://github.com/vitejs/vite
              </a>
            </li>
            <li>
              <strong>React Icons</strong> - Licensed under MIT
              <br />
              <a
                href="https://github.com/react-icons/react-icons"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://github.com/react-icons/react-icons
              </a>
            </li>
          </ul>
          <p>
            For a complete list of dependencies and their licenses, please refer to the
            <code>package.json</code> and <code>package-lock.json</code> files in our repository.
          </p>
        </section>

        <section>
          <h2>Pathfinder 2e Content</h2>
          <p>
            NeedOriginalPf2eTools is a third-party fan tool and is not affiliated with, endorsed
            by, or associated with Paizo Inc. or Pathfinder.
          </p>
          <p>
            Pathfinder is a trademark of Paizo Inc. This tool is created for personal use and fan
            enjoyment of the Pathfinder 2nd Edition game system.
          </p>
          <p>
            All Pathfinder 2nd Edition rules and content are the property of Paizo Inc. For
            official Pathfinder 2e rules and content, visit the{' '}
            <a href="https://2e.aonprd.com/" target="_blank" rel="noopener noreferrer">
              Archives of Nethys
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Intellectual Property Notice</h2>
          <p>
            This tool does not claim ownership over any Pathfinder 2nd Edition intellectual
            property. We respect all trademarks, copyrights, and intellectual property rights held
            by Paizo Inc.
          </p>
          <p>
            If you believe this tool violates your intellectual property rights, please contact us
            immediately.
          </p>
        </section>

        <section>
          <h2>Fair Use</h2>
          <p>
            NeedOriginalPf2eTools operates under the principles of fair use, using Pathfinder 2e
            content for transformative purposes including:
          </p>
          <ul>
            <li>Educational tool creation</li>
            <li>Community support and engagement</li>
            <li>Non-commercial utility provision</li>
            <li>Enhancing the player experience</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Art & Assets</h2>
          <p>
            Any third-party art, icons, or assets used in NeedOriginalPf2eTools are either:
          </p>
          <ul>
            <li>Licensed under permissive open source licenses</li>
            <li>Used with proper attribution</li>
            <li>In the public domain</li>
            <li>Used under fair use provisions</li>
          </ul>
          <p>
            If you believe an asset is used improperly, please open an issue on our{' '}
            <a href="https://github.com/needoriginalname/pf2ecardcreator" target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Questions About Licenses?</h2>
          <p>
            If you have questions about licensing, IP usage, or attribution, please reach out via
            email or create an issue on GitHub.
          </p>
        </section>
      </div>
    </main>
  )
}
