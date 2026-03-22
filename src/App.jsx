import { useMemo, useState } from 'react'
import './App.css'
import CardForm from './components/CardForm'
import CropModal from './components/CropModal'
import DeckSection from './components/DeckSection'
import PreviewPanel from './components/PreviewPanel'
import { initialCard } from './constants/card'
import { getCardSummary } from './utils/cardDisplay'
import { getCroppedImg } from './utils/imageCrop'

function App() {
  const [card, setCard] = useState(initialCard)
  const [deck, setDeck] = useState([])
  const [showCropModal, setShowCropModal] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [tempImage, setTempImage] = useState('')
  const [cropMode, setCropMode] = useState('front')
  const [previewBack, setPreviewBack] = useState(false)
  const [cardsPerRow, setCardsPerRow] = useState(3)

  const cardCount = deck.length

  const summary = useMemo(() => getCardSummary(card), [card])

  const onChange = (field) => (event) => {
    const value = event.target.value
    setCard((prev) => ({ ...prev, [field]: value }))
  }

  const onImageChange = (event, side = 'front') => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setTempImage(reader.result)
      setCropMode(side)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)
  }

  const onCropComplete = (_, nextCroppedAreaPixels) => {
    setCroppedAreaPixels(nextCroppedAreaPixels)
  }

  const resetCropState = () => {
    setShowCropModal(false)
    setTempImage('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const onCropConfirm = async () => {
    if (!tempImage || !croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels)
      if (cropMode === 'front') {
        setCard((prev) => ({ ...prev, image: croppedImage }))
      } else {
        setCard((prev) => ({ ...prev, imageBack: croppedImage }))
      }
      resetCropState()
    } catch (error) {
      console.error(error)
    }
  }

  const addCard = () => {
    if (!card.name.trim()) return
    setDeck((prev) => [...prev, { ...card, id: Date.now() }])
    setCard(initialCard)
    setPreviewBack(false)
  }

  const clearDeck = () => setDeck([])

  const handlePrint = () => {
    if (!deck.length) {
      alert('Please add at least one card to the deck before printing.')
      return
    }
    window.print()
  }

  const mailto = `mailto:?subject=PF2e card deck&body=${encodeURIComponent(
    `Hey,%0A%0Acheck out my PF2e cards:%0A${deck
      .map((entry) => `${entry.type}: ${entry.name} (Lvl ${entry.level})`)
      .join('%0A')}`
  )}`

  return (
    <main className="app-shell">
      <header className="top-bar">
        <h1>PF2e Card Designer</h1>
        <p>Design spell/item/monster cards and print locally.</p>
      </header>

      <section className="builder-grid">
        <CardForm
          card={card}
          onChange={onChange}
          onImageChange={onImageChange}
          onSubmit={(event) => {
            event.preventDefault()
            addCard()
          }}
          onClearDeck={clearDeck}
        />

        <PreviewPanel
          card={card}
          summary={summary}
          previewBack={previewBack}
          setPreviewBack={setPreviewBack}
        />
      </section>

      <DeckSection
        deck={deck}
        cardCount={cardCount}
        cardsPerRow={cardsPerRow}
        mailto={mailto}
        onCardsPerRowChange={setCardsPerRow}
        onPrint={handlePrint}
      />

      <footer className="note">
        Tip: For best results, print from Chrome/Edge using A4 or Letter portrait and 3mm
        margins.
      </footer>

      {showCropModal && (
        <CropModal
          tempImage={tempImage}
          crop={crop}
          zoom={zoom}
          cropMode={cropMode}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          onCancel={resetCropState}
          onConfirm={onCropConfirm}
        />
      )}
    </main>
  )
}

export default App
