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
import { getAllEquipment, replaceEquipmentBatch } from './utils/equipmentDatabase.js'
import {
  fetchHostedEquipmentSeed,
  getStoredEquipmentSeedSignature,
  setStoredEquipmentSeedSignature,
} from './utils/equipmentSeed.js'

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

  useEffect(() => {
    let isMounted = true

    const syncHostedEquipmentSeed = async () => {
      try {
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
      onOpenLootGenerator={() => navigate(TOOL_ROUTES.lootGenerator)}
      onOpenPrintableCards={() => navigate(TOOL_ROUTES.printableCards)}
    />
  )
}

export default App
