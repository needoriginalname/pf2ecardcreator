import { useEffect, useState } from 'react'
import './App.css'
import HomePage from './HomePage.jsx'
import LootGenerator from './LootGenerator.jsx'
import PrintableCardGenerator from './PrintableCardGenerator.jsx'

const TOOL_ROUTES = {
  home: '#/',
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

  return (
    <HomePage
      onOpenLootGenerator={() => navigate(TOOL_ROUTES.lootGenerator)}
      onOpenPrintableCards={() => navigate(TOOL_ROUTES.printableCards)}
    />
  )
}

export default App
