import { useMemo, useState } from 'react'
import './App.css'
import CardForm from './components/CardForm'
import CropModal from './components/CropModal'
import DeckSection from './components/DeckSection'
import PreviewPanel from './components/PreviewPanel'
import { createInitialCard } from './constants/card'
import { getCardSummary } from './utils/cardDisplay'
import { getRichTextPlainText } from './utils/richText.jsx'
import { getCroppedImg } from './utils/imageCrop'

const CARD_FORM_ID = 'card-editor-form'
const createDeckCard = (cardData) => ({
  ...structuredClone(cardData),
  id: crypto.randomUUID(),
})

function App() {
  const [card, setCard] = useState(createInitialCard)
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
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
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
    if (!getRichTextPlainText(card.name)) return
    setDeck((prev) => [...prev, createDeckCard(card)])
    setCard(createInitialCard())
    setPreviewBack(false)
  }

  const clearDeck = () => setDeck([])

  const deleteCard = (cardId) => {
    setDeck((prev) => prev.filter((entry) => entry.id !== cardId))
  }

  const duplicateCard = (index, position) => {
    setDeck((prev) => {
      const sourceCard = prev[index]
      if (!sourceCard) return prev

      const nextDeck = [...prev]
      const insertionIndex = position === 'before' ? index : index + 1
      nextDeck.splice(insertionIndex, 0, createDeckCard(sourceCard))
      return nextDeck
    })
  }

  const moveCard = (cardId, targetIndex) => {
    setDeck((prev) => {
      const sourceIndex = prev.findIndex((entry) => entry.id === cardId)
      if (sourceIndex === -1 || targetIndex < 0 || targetIndex >= prev.length) return prev
      if (sourceIndex === targetIndex) return prev

      const nextDeck = [...prev]
      const [movedCard] = nextDeck.splice(sourceIndex, 1)
      nextDeck.splice(targetIndex, 0, movedCard)
      return nextDeck
    })
  }

  const handlePrint = () => {
    if (!deck.length) {
      alert('Please add at least one card to the deck before printing.')
      return
    }
    window.print()
  }

  const mailto = `mailto:?subject=PF2e card deck&body=${encodeURIComponent(
    `Hey,%0A%0Acheck out my PF2e cards:%0A${deck
      .map((entry) => `${entry.type}: ${getRichTextPlainText(entry.name)} (Lvl ${entry.level})`)
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
          formId={CARD_FORM_ID}
          onActionTextChange={(value) => {
            setCard((prev) => ({ ...prev, actionCustom: value }))
          }}
          onChange={onChange}
          onDescriptionChange={(value) => {
            setCard((prev) => ({ ...prev, description: value }))
          }}
          onImageChange={onImageChange}
          onNameChange={(value) => {
            setCard((prev) => ({ ...prev, name: value }))
          }}
          onSubmit={(event) => {
            event.preventDefault()
            addCard()
          }}
          onTraitsChange={(value) => {
            setCard((prev) => ({ ...prev, traits: value }))
          }}
          onClearDeck={clearDeck}
        />

        <PreviewPanel
          card={card}
          summary={summary}
          previewBack={previewBack}
          setPreviewBack={setPreviewBack}
        />

        <div className="mobile-form-actions">
          <button type="submit" form={CARD_FORM_ID}>
            Add Card to Deck
          </button>
          <button type="button" onClick={clearDeck}>
            Clear Deck
          </button>
        </div>
      </section>

      <DeckSection
        deck={deck}
        cardCount={cardCount}
        cardsPerRow={cardsPerRow}
        mailto={mailto}
        onCardsPerRowChange={setCardsPerRow}
        onDeleteCard={deleteCard}
        onDuplicateCard={duplicateCard}
        onMoveCard={moveCard}
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
