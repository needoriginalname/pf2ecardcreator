import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import CardForm from './components/CardForm'
import CropModal from './components/CropModal'
import DeckSection from './components/DeckSection'
import PreviewPanel from './components/PreviewPanel'
import { createInitialCard } from './constants/card'
import { getCardSummary } from './utils/cardDisplay'
import { createEmptyRichTextValue, getRichTextPlainText } from './utils/richText.jsx'
import { getCroppedImg } from './utils/imageCrop'

const CARD_FORM_ID = 'card-editor-form'
const STORAGE_KEY = 'pf2e-card-designer-state-v1'
const RICH_TEXT_FIELDS = ['name', 'traits', 'actionCustom', 'description']

const createDeckCard = (cardData) => ({
  ...structuredClone(cardData),
  id: crypto.randomUUID(),
})

const clampCardsPerRow = (value) => Math.min(Math.max(value, 1), 8)

const toRichTextValue = (value) => {
  if (Array.isArray(value)) return structuredClone(value)

  return [
    {
      type: 'paragraph',
      children: [{ text: typeof value === 'string' ? value : '' }],
    },
  ]
}

const normalizeCardData = (cardData) => {
  const defaults = createInitialCard()
  const normalized = { ...defaults, ...(cardData ?? {}) }

  for (const field of RICH_TEXT_FIELDS) {
    normalized[field] = toRichTextValue(cardData?.[field] ?? createEmptyRichTextValue())
  }

  normalized.borderThickness = Number.isFinite(Number(cardData?.borderThickness))
    ? Number(cardData.borderThickness)
    : defaults.borderThickness

  normalized.descriptionBoxOpacity = Number.isFinite(Number(cardData?.descriptionBoxOpacity))
    ? Number(cardData.descriptionBoxOpacity)
    : defaults.descriptionBoxOpacity

  return normalized
}

const getDefaultAppState = () => ({
  card: createInitialCard(),
  deck: [],
  previewBack: false,
  cardsPerRow: 3,
})

const normalizeAppState = (snapshot) => {
  const defaults = getDefaultAppState()

  if (!snapshot || typeof snapshot !== 'object') {
    return defaults
  }

  return {
    card: normalizeCardData(snapshot.card),
    deck: Array.isArray(snapshot.deck)
      ? snapshot.deck.map((entry) => ({
          ...normalizeCardData(entry),
          id: entry?.id || crypto.randomUUID(),
        }))
      : defaults.deck,
    previewBack: Boolean(snapshot.previewBack),
    cardsPerRow: clampCardsPerRow(Number(snapshot.cardsPerRow) || defaults.cardsPerRow),
  }
}

const loadStoredAppState = () => {
  if (typeof window === 'undefined') {
    return getDefaultAppState()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultAppState()
    return normalizeAppState(JSON.parse(raw))
  } catch (error) {
    console.error(error)
    return getDefaultAppState()
  }
}

function App() {
  const initialSnapshotRef = useRef(null)
  const importInputRef = useRef(null)

  if (initialSnapshotRef.current === null) {
    initialSnapshotRef.current = loadStoredAppState()
  }

  const [card, setCard] = useState(initialSnapshotRef.current.card)
  const [deck, setDeck] = useState(initialSnapshotRef.current.deck)
  const [showCropModal, setShowCropModal] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [tempImage, setTempImage] = useState('')
  const [cropMode, setCropMode] = useState('front')
  const [previewBack, setPreviewBack] = useState(initialSnapshotRef.current.previewBack)
  const [cardsPerRow, setCardsPerRow] = useState(initialSnapshotRef.current.cardsPerRow)

  const cardCount = deck.length

  const summary = useMemo(() => getCardSummary(card), [card])
  const appSnapshot = useMemo(
    () => ({
      version: 1,
      card,
      deck,
      previewBack,
      cardsPerRow,
    }),
    [card, deck, previewBack, cardsPerRow]
  )

  const onChange = (field) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.type === 'range'
          ? Number(event.target.value)
          : event.target.value
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

  const applyAppState = (snapshot) => {
    const normalized = normalizeAppState(snapshot)
    setCard(normalized.card)
    setDeck(normalized.deck)
    setPreviewBack(normalized.previewBack)
    setCardsPerRow(normalized.cardsPerRow)
    resetCropState()
  }

  const onCropConfirm = async () => {
    if (!tempImage || !croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels)
      if (cropMode === 'front') {
        setCard((prev) => ({ ...prev, image: croppedImage }))
      } else if (cropMode === 'frontBackground') {
        setCard((prev) => ({
          ...prev,
          frontBackgroundImage: croppedImage,
          frontBackgroundMode: 'image',
        }))
      } else {
        setCard((prev) => ({
          ...prev,
          imageBack: croppedImage,
          backBackgroundMode: 'image',
        }))
      }
      resetCropState()
    } catch (error) {
      console.error(error)
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(appSnapshot, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'pf2e-card-designer.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const importJson = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result))
        applyAppState(imported)
      } catch (error) {
        console.error(error)
        alert('That JSON file could not be imported.')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
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

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appSnapshot))
    } catch (error) {
      console.error(error)
    }
  }, [appSnapshot])

  return (
    <main className="app-shell">
      <header className="top-bar">
        <h1>PF2e Card Designer</h1>
        <p>Design spell/item/monster cards and print locally.</p>
        <div className="app-actions">
          <button type="button" onClick={exportJson}>
            Export JSON
          </button>
          <button type="button" onClick={() => importInputRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={importInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={importJson}
          />
        </div>
        <p className="storage-note">Changes are saved automatically in this browser.</p>
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
