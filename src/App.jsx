import { useEffect, useState } from 'react'
import './styles/common.css'
import './styles/home.css'
import './styles/cards.css'
import './styles/loot.css'
import './styles/equipment.css'
import EquipmentImporter from './EquipmentImporter.jsx'
import HomePage from './HomePage.jsx'
import LootGenerator from './LootGenerator.jsx'
import PrintableCardGenerator from './PrintableCardGenerator.jsx'

const TOOL_ROUTES = {
  home: '#/',
  equipmentImporter: '#/equipment-importer',
  lootGenerator: '#/loot-generator',
  printableCards: '#/printable-card-generator',
}

const getCurrentRoute = () => {
  if (typeof window === 'undefined') return TOOL_ROUTES.home
  return window.location.hash || TOOL_ROUTES.home
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

  const navigate = (nextRoute) => {
    if (typeof window === 'undefined') {
      setRoute(nextRoute)
      return
    }

    window.location.hash = nextRoute
  }

  if (route === TOOL_ROUTES.printableCards) {
    return <PrintableCardGenerator onBackHome={() => navigate(TOOL_ROUTES.home)} />
  }

  if (route === TOOL_ROUTES.lootGenerator) {
    return <LootGenerator onBackHome={() => navigate(TOOL_ROUTES.home)} />
  }

  if (route === TOOL_ROUTES.equipmentImporter) {
    return <EquipmentImporter onBackHome={() => navigate(TOOL_ROUTES.home)} />
  }

  return (
    <HomePage
      onOpenEquipmentImporter={() => navigate(TOOL_ROUTES.equipmentImporter)}
      onOpenLootGenerator={() => navigate(TOOL_ROUTES.lootGenerator)}
      onOpenPrintableCards={() => navigate(TOOL_ROUTES.printableCards)}
    />
  )
}

export default App
