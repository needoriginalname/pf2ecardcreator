import { Suspense, lazy, useEffect, useState } from 'react'
import './styles/common.css'
import './styles/home.css'
import './styles/cards.css'
import './styles/loot.css'
import './styles/equipment.css'
import './styles/initiative.css'
import HomePage from './HomePage.jsx'

const EquipmentImporter = lazy(() => import('./EquipmentImporter.jsx'))
const InitiativeTracker = lazy(() => import('./InitiativeTracker.jsx'))
const LootGenerator = lazy(() => import('./LootGenerator.jsx'))
const PrintableCardGenerator = lazy(() => import('./PrintableCardGenerator.jsx'))

const TOOL_ROUTES = {
  home: '#/',
  equipmentImporter: '#/equipment-importer',
  initiativeTracker: '#/initiative-tracker',
  lootGenerator: '#/loot-generator',
  printableCards: '#/printable-card-generator',
}

const getCurrentRoute = () => {
  if (typeof window === 'undefined') return TOOL_ROUTES.home
  return window.location.hash || TOOL_ROUTES.home
}

function LoadingPage({ label }) {
  return (
    <main className="loading-shell" aria-live="polite" aria-busy="true">
      <div className="loading-card">
        <div className="loading-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="loading-kicker">Opening tool</p>
          <h1>{label}</h1>
          <p>Preparing the workspace...</p>
        </div>
      </div>
    </main>
  )
}

function App() {
  const [route, setRoute] = useState(getCurrentRoute)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleHashChange = () => {
      setRoute(getCurrentRoute())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const syncHostedEquipmentSeed = async () => {
      try {
        const [{ getAllEquipment, replaceEquipmentBatch }, equipmentSeed] = await Promise.all([
          import('./utils/equipmentDatabase.js'),
          import('./utils/equipmentSeed.js'),
        ])
        const {
          fetchHostedEquipmentSeed,
          getStoredEquipmentSeedSignature,
          setStoredEquipmentSeedSignature,
        } = equipmentSeed
        const hostedSeed = await fetchHostedEquipmentSeed()
        if (!isMounted || !hostedSeed || hostedSeed.items.length === 0) return

        const storedEquipment = await getAllEquipment()
        if (getStoredEquipmentSeedSignature() === hostedSeed.signature && storedEquipment.length > 0) return

        await replaceEquipmentBatch(hostedSeed.items)
        setStoredEquipmentSeedSignature(hostedSeed.signature)
      } catch {
        // The importer page surfaces seed loading details; startup syncing should stay quiet.
      }
    }

    syncHostedEquipmentSeed()

    return () => {
      isMounted = false
    }
  }, [])

  const navigate = (nextRoute) => {
    if (typeof window === 'undefined') {
      setRoute(nextRoute)
      return
    }

    window.location.hash = nextRoute
  }

  if (route === TOOL_ROUTES.printableCards) {
    return (
      <Suspense fallback={<LoadingPage label="Printable Card Generator" />}>
        <PrintableCardGenerator onBackHome={() => navigate(TOOL_ROUTES.home)} />
      </Suspense>
    )
  }

  if (route === TOOL_ROUTES.lootGenerator) {
    return (
      <Suspense fallback={<LoadingPage label="Loot Generator" />}>
        <LootGenerator onBackHome={() => navigate(TOOL_ROUTES.home)} />
      </Suspense>
    )
  }

  if (route === TOOL_ROUTES.initiativeTracker) {
    return (
      <Suspense fallback={<LoadingPage label="Initiative Tracker" />}>
        <InitiativeTracker onBackHome={() => navigate(TOOL_ROUTES.home)} />
      </Suspense>
    )
  }

  if (route === TOOL_ROUTES.equipmentImporter) {
    return (
      <Suspense fallback={<LoadingPage label="Equipment Importer" />}>
        <EquipmentImporter onBackHome={() => navigate(TOOL_ROUTES.home)} />
      </Suspense>
    )
  }

  return (
    <HomePage
      onOpenInitiativeTracker={() => navigate(TOOL_ROUTES.initiativeTracker)}
      onOpenLootGenerator={() => navigate(TOOL_ROUTES.lootGenerator)}
      onOpenPrintableCards={() => navigate(TOOL_ROUTES.printableCards)}
    />
  )
}

export default App
