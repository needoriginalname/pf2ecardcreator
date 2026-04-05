import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import CardForm from './components/CardForm'
import CropModal from './components/CropModal'
import DeckSection from './components/DeckSection'
import PreviewPanel from './components/PreviewPanel'
import { createInitialCard } from './constants/card'
import {
  CARD_TEMPLATE_OPTIONS,
  createTemplateStarterCard,
  GENERIC_TEMPLATE_ID,
  getTemplateOptions,
  TEMPLATE_DEFINITION_KIND,
  TEMPLATE_DEFINITION_VERSION,
} from './constants/templates'
import { getCardSummary } from './utils/cardDisplay'
import { createEmptyRichTextValue, getRichTextPlainText } from './utils/richText.jsx'
import { getCroppedImg } from './utils/imageCrop'

const CARD_FORM_ID = 'card-editor-form'
const STORAGE_KEY = 'pf2e-card-designer-state-v1'
const CUSTOM_TEMPLATE_ID_PREFIX = 'custom:'
const RICH_TEXT_FIELD_DEFAULTS = {
  name: 'left',
  backTitle: 'center',
  traits: 'center',
  actionCustom: 'right',
  description: 'left',
  frontArtworkText: 'left',
}
const RICH_TEXT_FIELDS = Object.keys(RICH_TEXT_FIELD_DEFAULTS)
const EMPTY_DECK = []
const FRONT_ARTWORK_LAYOUTS_WITH_IMAGE = new Set([
  'art-only',
  'art-left-text-right',
  'text-left-art-right',
])
const BUILT_IN_TEMPLATE_IDS = new Set(CARD_TEMPLATE_OPTIONS.map((option) => option.value))
const FRONT_ARTWORK_LAYOUT_HIDDEN_RESERVED = 'hidden-preserve-space'

const createDeckCard = (cardData) => ({
  ...structuredClone(cardData),
  id: crypto.randomUUID(),
})

const clampCardsPerRow = (value) => Math.min(Math.max(value, 1), 8)
const clampArtworkBorderThickness = (value, fallback) =>
  Math.min(Math.max(normalizeNumericField(value, fallback), 0), 4)
const clampFrameCurve = (value, fallback) =>
  Math.min(Math.max(normalizeNumericField(value, fallback), 0), 24)
const normalizeNumericField = (value, fallback) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback
const isCustomTemplateId = (value) =>
  typeof value === 'string' && value.startsWith(CUSTOM_TEMPLATE_ID_PREFIX)
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
const createCustomTemplateId = (label) =>
  `${CUSTOM_TEMPLATE_ID_PREFIX}${slugify(label) || 'template'}-${crypto.randomUUID().slice(0, 8)}`

const normalizeFrontArtworkLayout = (cardData, fallback) => {
  if (typeof cardData?.frontArtworkLayout === 'string') {
    if (
      cardData.frontArtworkLayout === 'hidden' &&
      typeof cardData?.collapseHiddenArtworkSpace === 'boolean' &&
      !cardData.collapseHiddenArtworkSpace
    ) {
      return FRONT_ARTWORK_LAYOUT_HIDDEN_RESERVED
    }
    return cardData.frontArtworkLayout
  }

  if (typeof cardData?.showFrontArtwork === 'boolean') {
    return cardData.showFrontArtwork ? 'art-only' : 'hidden'
  }

  if (typeof cardData?.frontArtworkRemoved === 'boolean') {
    return cardData.frontArtworkRemoved ? 'hidden' : 'art-only'
  }

  return fallback
}

const toRichTextValue = (value) => {
  if (Array.isArray(value)) return structuredClone(value)

  return [
    {
      type: 'paragraph',
      children: [{ text: typeof value === 'string' ? value : '' }],
    },
  ]
}

const getLegacyActionRichText = (cardData) => {
  if (Array.isArray(cardData?.actionCustom) || (typeof cardData?.actionCustom === 'string' && cardData.actionCustom.trim())) {
    return cardData.actionCustom
  }

  if (typeof cardData?.actionIcon === 'string' && cardData.actionIcon.trim()) {
    return cardData.actionIcon
  }

  return createEmptyRichTextValue(RICH_TEXT_FIELD_DEFAULTS.actionCustom)
}

const normalizeCardData = (cardData, allowedTemplateIds = BUILT_IN_TEMPLATE_IDS) => {
  const defaults = createInitialCard()
  const normalized = { ...defaults, ...(cardData ?? {}) }

  for (const field of RICH_TEXT_FIELDS) {
    const fieldValue =
      field === 'actionCustom'
        ? getLegacyActionRichText(cardData)
        : cardData?.[field] ?? createEmptyRichTextValue(RICH_TEXT_FIELD_DEFAULTS[field])
    normalized[field] = toRichTextValue(fieldValue)
  }

  normalized.borderThickness = normalizeNumericField(
    cardData?.borderThickness,
    defaults.borderThickness
  )
  normalized.frontArtworkBorderThickness = clampArtworkBorderThickness(
    cardData?.frontArtworkBorderThickness,
    defaults.frontArtworkBorderThickness
  )
  normalized.cardFrameCurve = clampFrameCurve(cardData?.cardFrameCurve, defaults.cardFrameCurve)
  normalized.frontArtworkFrameCurve = clampFrameCurve(
    cardData?.frontArtworkFrameCurve,
    defaults.frontArtworkFrameCurve
  )
  normalized.descriptionBoxOpacity = normalizeNumericField(
    cardData?.descriptionBoxOpacity,
    defaults.descriptionBoxOpacity
  )
  normalized.backTitleBoxOpacity = normalizeNumericField(
    cardData?.backTitleBoxOpacity,
    defaults.backTitleBoxOpacity
  )
  normalized.templateId = allowedTemplateIds.has(cardData?.templateId)
    ? cardData.templateId
    : defaults.templateId
  normalized.frontArtworkLayout = normalizeFrontArtworkLayout(cardData, defaults.frontArtworkLayout)

  delete normalized.type
  delete normalized.level
  delete normalized.rarity
  delete normalized.school
  delete normalized.actionIcon
  delete normalized.showFrontArtwork
  delete normalized.collapseHiddenArtworkSpace
  delete normalized.frontArtworkRemoved

  return normalized
}

const normalizeCustomTemplate = (templateData, index = 0) => {
  if (!templateData || typeof templateData !== 'object') {
    return null
  }

  const label =
    typeof templateData.label === 'string' && templateData.label.trim()
      ? templateData.label.trim()
      : `Custom Template ${index + 1}`
  const id = isCustomTemplateId(templateData.id)
    ? templateData.id
    : createCustomTemplateId(label)
  const starterCard = normalizeCardData(
    {
      ...templateData.starterCard,
      templateId: id,
    },
    new Set([...BUILT_IN_TEMPLATE_IDS, id])
  )

  return {
    id,
    label,
    description:
      typeof templateData.description === 'string' && templateData.description.trim()
        ? templateData.description.trim()
        : `Custom template based on ${label}.`,
    starterCard,
  }
}

const createCustomTemplateFromCard = (cardData, metadata, existingId) => {
  const label = metadata.label.trim()
  const id = existingId ?? createCustomTemplateId(label)
  const starterCard = normalizeCardData(
    {
      ...structuredClone(cardData),
      templateId: id,
    },
    new Set([...BUILT_IN_TEMPLATE_IDS, id])
  )

  return {
    id,
    label,
    description: metadata.description.trim() || `Custom template based on ${label}.`,
    starterCard,
  }
}

const getDefaultAppState = () => ({
  card: createInitialCard(),
  customTemplates: [],
  deck: EMPTY_DECK,
  previewBack: false,
  cardsPerRow: 3,
})

const normalizeAppState = (snapshot) => {
  const defaults = getDefaultAppState()

  if (!snapshot || typeof snapshot !== 'object') {
    return defaults
  }

  const customTemplates = Array.isArray(snapshot.customTemplates)
    ? snapshot.customTemplates
        .map((template, index) => normalizeCustomTemplate(template, index))
        .filter(Boolean)
    : []
  const allowedTemplateIds = new Set([
    ...BUILT_IN_TEMPLATE_IDS,
    ...customTemplates.map((template) => template.id),
  ])

  return {
    card: normalizeCardData(snapshot.card, allowedTemplateIds),
    customTemplates,
    deck: Array.isArray(snapshot.deck)
      ? snapshot.deck.map((entry) => ({
          ...normalizeCardData(entry, allowedTemplateIds),
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
  const importTemplateInputRef = useRef(null)

  if (initialSnapshotRef.current === null) {
    initialSnapshotRef.current = loadStoredAppState()
  }

  const initialSnapshot = initialSnapshotRef.current

  const [card, setCard] = useState(initialSnapshot.card)
  const [customTemplates, setCustomTemplates] = useState(initialSnapshot.customTemplates)
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

  const cardCount = deck.length

  const summary = useMemo(() => getCardSummary(card), [card])
  const isEditing = Boolean(editingCardId)
  const templateOptions = useMemo(() => getTemplateOptions(customTemplates), [customTemplates])
  const appSnapshot = useMemo(
    () => ({
      version: 1,
      card,
      customTemplates,
      deck,
      previewBack,
      cardsPerRow,
    }),
    [card, customTemplates, deck, previewBack, cardsPerRow]
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
    setCustomTemplates(normalized.customTemplates)
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
          frontArtworkLayout: FRONT_ARTWORK_LAYOUTS_WITH_IMAGE.has(prev.frontArtworkLayout)
            ? prev.frontArtworkLayout
            : 'art-only',
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
    const blob = new Blob([JSON.stringify(appSnapshot)], {
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

  const promptTemplateMetadata = (existingTemplate) => {
    const fallbackLabel =
      existingTemplate?.label || getRichTextPlainText(card.name) || 'Custom Template'
    const labelInput = window.prompt('Template name', fallbackLabel)
    if (labelInput === null) return null

    const label = labelInput.trim()
    if (!label) {
      alert('Template name is required.')
      return null
    }

    const descriptionInput = window.prompt(
      'Template description',
      existingTemplate?.description || `Custom template based on ${label}.`
    )
    if (descriptionInput === null) return null

    return {
      label,
      description: descriptionInput.trim(),
    }
  }

  const saveCurrentAsTemplate = () => {
    const existingTemplate = customTemplates.find((template) => template.id === card.templateId)
    const metadata = promptTemplateMetadata(existingTemplate)
    if (!metadata) return

    const nextTemplate = createCustomTemplateFromCard(card, metadata, existingTemplate?.id)

    setCustomTemplates((prev) => {
      const existingIndex = prev.findIndex((template) => template.id === nextTemplate.id)
      if (existingIndex === -1) {
        return [...prev, nextTemplate]
      }

      const nextTemplates = [...prev]
      nextTemplates[existingIndex] = nextTemplate
      return nextTemplates
    })
    setCard((prev) => ({ ...prev, templateId: nextTemplate.id }))
  }

  const exportCurrentAsTemplate = () => {
    const existingTemplate = customTemplates.find((template) => template.id === card.templateId)
    const metadata = promptTemplateMetadata(existingTemplate)
    if (!metadata) return

    const templateExport = createCustomTemplateFromCard(card, metadata, existingTemplate?.id)
    const blob = new Blob(
      [
          JSON.stringify({
            kind: TEMPLATE_DEFINITION_KIND,
            version: TEMPLATE_DEFINITION_VERSION,
            template: templateExport,
          }),
      ],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${slugify(templateExport.label) || 'custom-template'}.template.json`
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

  const applyTemplateCard = (templateId, nextCustomTemplates = customTemplates) => {
    setCard({
      ...createInitialCard(),
      ...createTemplateStarterCard(templateId, nextCustomTemplates),
    })
    setPreviewBack(false)
    setEditingCardId(null)
    bumpEditorSession()
  }

  const importTemplate = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = ({ target }) => {
      try {
        const imported = JSON.parse(String(target?.result))
        const candidate =
          imported?.kind === TEMPLATE_DEFINITION_KIND ? imported.template : imported
        const normalizedTemplate = normalizeCustomTemplate(candidate)
        if (!normalizedTemplate) {
          throw new Error('Invalid template file.')
        }

        let nextTemplates
        setCustomTemplates((prev) => {
          const existingIndex = prev.findIndex((template) => template.id === normalizedTemplate.id)
          nextTemplates =
            existingIndex === -1
              ? [...prev, normalizedTemplate]
              : prev.map((template, index) =>
                  index === existingIndex ? normalizedTemplate : template
                )
          return nextTemplates
        })
        applyTemplateCard(normalizedTemplate.id, nextTemplates)
      } catch (error) {
        console.error(error)
        alert('That template file could not be imported.')
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

  const applyTemplate = (templateId) => {
    const allowedTemplateIds = new Set([
      ...BUILT_IN_TEMPLATE_IDS,
      ...customTemplates.map((template) => template.id),
    ])
    const nextTemplateId = allowedTemplateIds.has(templateId) ? templateId : GENERIC_TEMPLATE_ID
    applyTemplateCard(nextTemplateId)
  }

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
          <input
            ref={importTemplateInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={importTemplate}
          />
        </div>
        <p className="storage-note">Changes are saved automatically in this browser.</p>
      </header>

      <section className="builder-grid">
        <CardForm
          card={card}
          customTemplates={customTemplates}
          editorSessionKey={editorSessionKey}
          formId={CARD_FORM_ID}
          isEditing={isEditing}
          onApplyTemplate={applyTemplate}
          onActionTextChange={(value) => updateCardField('actionCustom', value)}
          onBackTitleChange={(value) => updateCardField('backTitle', value)}
          onChange={onChange}
          onDescriptionChange={(value) => updateCardField('description', value)}
          onExportCurrentAsTemplate={exportCurrentAsTemplate}
          onFrontArtworkTextChange={(value) => updateCardField('frontArtworkText', value)}
          onImportTemplate={() => importTemplateInputRef.current?.click()}
          onImageChange={onImageChange}
          onNameChange={(value) => updateCardField('name', value)}
          onSubmit={(event) => {
            event.preventDefault()
            submitCard()
          }}
          onResetInputs={resetEditor}
          onSaveCurrentAsTemplate={saveCurrentAsTemplate}
          templateOptions={templateOptions}
          onTraitsChange={(value) => updateCardField('traits', value)}
        />

        <PreviewPanel
          card={card}
          summary={summary}
          previewBack={previewBack}
          setPreviewBack={setPreviewBack}
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
        <br />
        Check your print page preview before printing. The on-screen preview is only an
        estimation.
      </footer>

      {showCropModal && (
        <CropModal
          tempImage={tempImage}
          crop={crop}
          zoom={zoom}
          cropMode={cropMode}
          frontArtworkLayout={card.frontArtworkLayout}
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
