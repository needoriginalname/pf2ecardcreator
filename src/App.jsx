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
const EMPTY_DECK = []
const DECK_SECTION_PADDING_PX = 28
const DECK_GRID_GAP_PX = 12

const createDeckCard = (cardData) => ({
  ...structuredClone(cardData),
  id: crypto.randomUUID(),
})

const clampCardsPerRow = (value) => Math.min(Math.max(value, 1), 8)
const clampArtworkBorderThickness = (value, fallback) =>
  Math.min(Math.max(normalizeNumericField(value, fallback), 0), 4)
const normalizeNumericField = (value, fallback) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback

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

  normalized.borderThickness = normalizeNumericField(
    cardData?.borderThickness,
    defaults.borderThickness
  )
  normalized.frontArtworkBorderThickness = clampArtworkBorderThickness(
    cardData?.frontArtworkBorderThickness,
    defaults.frontArtworkBorderThickness
  )
  normalized.descriptionBoxOpacity = normalizeNumericField(
    cardData?.descriptionBoxOpacity,
    defaults.descriptionBoxOpacity
  )
  normalized.showFrontArtwork =
    typeof cardData?.showFrontArtwork === 'boolean'
      ? cardData.showFrontArtwork
      : typeof cardData?.frontArtworkRemoved === 'boolean'
        ? !cardData.frontArtworkRemoved
        : defaults.showFrontArtwork

  delete normalized.type
  delete normalized.level
  delete normalized.rarity
  delete normalized.frontArtworkRemoved

  return normalized
}

const getDefaultAppState = () => ({
  card: createInitialCard(),
  deck: EMPTY_DECK,
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
  const appShellRef = useRef(null)

  if (initialSnapshotRef.current === null) {
    initialSnapshotRef.current = loadStoredAppState()
  }

  const initialSnapshot = initialSnapshotRef.current

  const [card, setCard] = useState(initialSnapshot.card)
  const [deck, setDeck] = useState(initialSnapshot.deck)
  const [showCropModal, setShowCropModal] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [tempImage, setTempImage] = useState('')
  const [cropMode, setCropMode] = useState('front')
  const [previewBack, setPreviewBack] = useState(initialSnapshot.previewBack)
  const [cardsPerRow, setCardsPerRow] = useState(initialSnapshot.cardsPerRow)
  const [editingCardId, setEditingCardId] = useState(null)
  const [editorSessionKey, setEditorSessionKey] = useState(0)
  const [appShellContentWidth, setAppShellContentWidth] = useState(0)

  const cardCount = deck.length

  const summary = useMemo(() => getCardSummary(card), [card])
  const isEditing = Boolean(editingCardId)
  const previewCardWidth = useMemo(() => {
    if (!appShellContentWidth) {
      return 2.48 * 96
    }

    return Math.max(
      0,
      (appShellContentWidth -
        DECK_SECTION_PADDING_PX -
        DECK_GRID_GAP_PX * Math.max(cardsPerRow - 1, 0)) /
        cardsPerRow
    )
  }, [appShellContentWidth, cardsPerRow])
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

  const bumpEditorSession = () => {
    setEditorSessionKey((prev) => prev + 1)
  }

  const updateCardField = (field, value) => {
    setCard((prev) => ({ ...prev, [field]: value }))
  }

  const onChange = (field) => (event) => {
    const value =
      event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.type === 'range'
          ? Number(event.target.value)
          : event.target.value
    updateCardField(field, value)
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
    setEditingCardId(null)
    bumpEditorSession()
    resetCropState()
  }

  const onCropConfirm = async () => {
    if (!tempImage || !croppedAreaPixels) return

    try {
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels)
      if (cropMode === 'front') {
        setCard((prev) => ({
          ...prev,
          image: croppedImage,
          showFrontArtwork: true,
        }))
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
    reader.onload = ({ target }) => {
      try {
        const imported = JSON.parse(String(target?.result))
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

  const resetEditor = () => {
    setCard(createInitialCard())
    setPreviewBack(false)
    setEditingCardId(null)
    bumpEditorSession()
  }

  const submitCard = () => {
    if (!getRichTextPlainText(card.name)) return

    if (editingCardId) {
      setDeck((prev) =>
        prev.map((entry) =>
          entry.id === editingCardId ? { ...structuredClone(card), id: editingCardId } : entry
        )
      )
    } else {
      setDeck((prev) => [...prev, createDeckCard(card)])
    }

    resetEditor()
  }

  const clearDeck = () => {
    setDeck([])
    if (editingCardId) {
      resetEditor()
    }
  }

  const deleteCard = (cardId) => {
    setDeck((prev) => prev.filter((entry) => entry.id !== cardId))
    if (cardId === editingCardId) {
      resetEditor()
    }
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

  const editCard = (cardId) => {
    const selectedCard = deck.find((entry) => entry.id === cardId)
    if (!selectedCard) return

    const { id, ...cardData } = selectedCard
    setCard(structuredClone(cardData))
    setEditingCardId(id)
    setPreviewBack(false)
    bumpEditorSession()
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
      .map((entry) => getRichTextPlainText(entry.name))
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

  useEffect(() => {
    if (typeof window === 'undefined' || !appShellRef.current) {
      return undefined
    }

    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 0
      setAppShellContentWidth(nextWidth)
    })

    observer.observe(appShellRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <main ref={appShellRef} className="app-shell">
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
          editorSessionKey={editorSessionKey}
          formId={CARD_FORM_ID}
          isEditing={isEditing}
          onActionTextChange={(value) => updateCardField('actionCustom', value)}
          onChange={onChange}
          onDescriptionChange={(value) => updateCardField('description', value)}
          onImageChange={onImageChange}
          onNameChange={(value) => updateCardField('name', value)}
          onSubmit={(event) => {
            event.preventDefault()
            submitCard()
          }}
          onResetInputs={resetEditor}
          onTraitsChange={(value) => updateCardField('traits', value)}
        />

        <PreviewPanel
          card={card}
          summary={summary}
          previewBack={previewBack}
          setPreviewBack={setPreviewBack}
          cardsPerRow={cardsPerRow}
          previewCardWidth={previewCardWidth}
        />

        <div className="mobile-form-actions">
          <button type="submit" form={CARD_FORM_ID}>
            {isEditing ? 'Update Card' : 'Add Card to Deck'}
          </button>
          <button type="button" onClick={resetEditor}>
            Reset Inputs
          </button>
        </div>
      </section>

      <DeckSection
        deck={deck}
        cardCount={cardCount}
        cardsPerRow={cardsPerRow}
        mailto={mailto}
        onCardsPerRowChange={setCardsPerRow}
        onClearDeck={clearDeck}
        onDeleteCard={deleteCard}
        onDuplicateCard={duplicateCard}
        onEditCard={editCard}
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
