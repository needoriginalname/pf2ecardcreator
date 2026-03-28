import { useEffect, useState } from 'react'
import RichTextEditor from './RichTextEditor'
import { getTemplateDetails } from '../constants/templates'

const EDITOR_TABS = [
  { id: 'text', label: 'Text Fields' },
  { id: 'images', label: 'Images' },
  { id: 'layout', label: 'Card Layout' },
]

const GRADIENT_OPTIONS = [
  { value: 'linear', label: 'Diagonal' },
  { value: 'diagonal-reverse', label: 'Diagonal reverse' },
  { value: 'top-bottom', label: 'Top to bottom' },
  { value: 'left-right', label: 'Left to right' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
]

const FRONT_ARTWORK_LAYOUT_OPTIONS = [
  { value: 'art-only', label: 'Only artwork' },
  { value: 'art-left-text-right', label: 'Left art, right text' },
  { value: 'text-left-art-right', label: 'Left text, right art' },
  { value: 'hidden', label: 'Hide completely' },
  { value: 'hidden-preserve-space', label: "Hide completely but don't reposition" },
]

const FIELD_PLACEHOLDERS = {
  name: 'Card name',
  traits: 'Traits',
  action: 'Action line',
  description: 'Description',
  artSide: 'Artwork side text',
}

function EditorTabButton({ id, label, activeTab, onSelect }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activeTab === id}
      className={activeTab === id ? 'active' : ''}
      onClick={() => onSelect(id)}
    >
      {label}
    </button>
  )
}

function SurfaceInspector({
  title,
  description,
  mode,
  gradientType,
  primaryColor,
  secondaryColor,
  onModeChange,
  onGradientTypeChange,
  onPrimaryColorChange,
  onSecondaryColorChange,
}) {
  const usesGradient = mode === 'gradient'
  const usesColorFill = mode === 'solid' || mode === 'gradient'

  return (
    <div className="inspector-group">
      <div className="inspector-group-heading">
        <h4>{title}</h4>
        <span>{description}</span>
      </div>

      <div className="inspector-row">
        <span className="inspector-label">Mode</span>
        <div className="inspector-control">
          <select value={mode} onChange={onModeChange}>
            <option value="solid">Solid color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Custom image</option>
          </select>
        </div>
      </div>

      {usesGradient ? (
        <div className="inspector-row">
          <span className="inspector-label">Gradient</span>
          <div className="inspector-control">
            <select value={gradientType} onChange={onGradientTypeChange}>
              {GRADIENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {usesColorFill ? (
        <div className="inspector-row">
          <span className="inspector-label">Primary</span>
          <div className="inspector-control inspector-control-inline">
            <input type="color" value={primaryColor} onChange={onPrimaryColorChange} />
            <code>{primaryColor}</code>
          </div>
        </div>
      ) : null}

      {usesGradient ? (
        <div className="inspector-row">
          <span className="inspector-label">Secondary</span>
          <div className="inspector-control inspector-control-inline">
            <input type="color" value={secondaryColor} onChange={onSecondaryColorChange} />
            <code>{secondaryColor}</code>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CardForm({
  card,
  customTemplates,
  editorSessionKey,
  formId,
  isEditing,
  onApplyTemplate,
  onActionTextChange,
  onChange,
  onDescriptionChange,
  onExportCurrentAsTemplate,
  onFrontArtworkTextChange,
  onImportTemplate,
  onImageChange,
  onNameChange,
  onResetInputs,
  onSaveCurrentAsTemplate,
  onSubmit,
  templateOptions,
  onTraitsChange,
}) {
  const [activeTab, setActiveTab] = useState('text')
  const [selectedTemplateId, setSelectedTemplateId] = useState(card.templateId)
  const frontArtworkLayoutUsesImage =
    card.frontArtworkLayout === 'art-only' ||
    card.frontArtworkLayout === 'art-left-text-right' ||
    card.frontArtworkLayout === 'text-left-art-right'
  const frontArtworkLayoutUsesText =
    card.frontArtworkLayout === 'art-left-text-right' ||
    card.frontArtworkLayout === 'text-left-art-right'
  const frontSurfaceUsesImage = card.frontBackgroundMode === 'image'
  const backSurfaceUsesImage = card.backBackgroundMode === 'image'
  const selectedTemplateDetails = getTemplateDetails(selectedTemplateId, customTemplates)

  useEffect(() => {
    setSelectedTemplateId(card.templateId)
  }, [card.templateId])

  return (
    <form id={formId} className="card-form" onSubmit={onSubmit} aria-label="Card editor">
      <div className="template-panel">
        <div className="template-panel-copy">
          <h3>Template</h3>
          <p>{selectedTemplateDetails.description}</p>
        </div>
        <div className="template-panel-controls">
          <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)}>
            {templateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => onApplyTemplate(selectedTemplateId)}>
            Load Template Starter
          </button>
        </div>
        <div className="template-panel-actions">
          <button type="button" onClick={onSaveCurrentAsTemplate}>
            Save Current as Template
          </button>
          <button type="button" onClick={onExportCurrentAsTemplate}>
            Export Current as Template
          </button>
          <button type="button" onClick={onImportTemplate}>
            Import Template
          </button>
        </div>
      </div>

      <div className="editor-tabs" role="tablist" aria-label="Card editor sections">
        {EDITOR_TABS.map((tab) => (
          <EditorTabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            activeTab={activeTab}
            onSelect={setActiveTab}
          />
        ))}
      </div>

      {activeTab === 'text' ? (
        <section className="editor-tab-panel" role="tabpanel" aria-label="Text fields">
          <div className="form-field">
            <span className="field-label">Name</span>
            <RichTextEditor
              key={`name-${editorSessionKey}`}
              value={card.name}
              onChange={onNameChange}
              placeholder={FIELD_PLACEHOLDERS.name}
              defaultAlignment="left"
              compact
              singleLine
            />
          </div>

          <div className="form-field">
            <span className="field-label">Traits</span>
            <RichTextEditor
              key={`traits-${editorSessionKey}`}
              value={card.traits}
              onChange={onTraitsChange}
              placeholder={FIELD_PLACEHOLDERS.traits}
              defaultAlignment="center"
              compact
              singleLine
            />
          </div>

          <div className="form-field">
            <span className="field-label">Action Line</span>
            <RichTextEditor
              key={`action-${editorSessionKey}`}
              value={card.actionCustom}
              onChange={onActionTextChange}
              placeholder={FIELD_PLACEHOLDERS.action}
              defaultAlignment="right"
              compact
              singleLine
            />
          </div>

          <div className="form-field">
            <span className="field-label">Description</span>
            <RichTextEditor
              key={`description-${editorSessionKey}`}
              value={card.description}
              onChange={onDescriptionChange}
              placeholder={FIELD_PLACEHOLDERS.description}
              defaultAlignment="left"
              enableTables
            />
          </div>

          {frontArtworkLayoutUsesText ? (
            <div className="form-field">
              <span className="field-label">Artwork side text</span>
              <RichTextEditor
                key={`front-art-text-${editorSessionKey}`}
                value={card.frontArtworkText}
                onChange={onFrontArtworkTextChange}
                placeholder={FIELD_PLACEHOLDERS.artSide}
                defaultAlignment="left"
                enableTables
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {activeTab === 'images' ? (
        <section className="editor-tab-panel" role="tabpanel" aria-label="Image fields">
          <div className="form-field">
            <span className="field-label">Front artwork area</span>
            <select value={card.frontArtworkLayout} onChange={onChange('frontArtworkLayout')}>
              {FRONT_ARTWORK_LAYOUT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <span className="field-label">Front artwork file</span>
            <input
              id="card-artwork"
              type="file"
              accept="image/*"
              disabled={!frontArtworkLayoutUsesImage}
              onChange={(event) => onImageChange(event, 'front')}
            />
            {!frontArtworkLayoutUsesImage ? (
              <p className="field-hint">Needs Front artwork area set to a layout that includes art.</p>
            ) : null}
          </div>

          {frontArtworkLayoutUsesImage ? (
            <div className="form-field">
              <span className="field-label">Artwork alpha background</span>
              <select
                value={card.frontArtworkBackgroundMode}
                onChange={onChange('frontArtworkBackgroundMode')}
              >
                <option value="transparent">Transparent</option>
                <option value="color">Solid color</option>
              </select>
              <p className="field-hint">
                Transparent pixels can show the front surface behind the artwork.
              </p>
            </div>
          ) : null}

          {frontArtworkLayoutUsesImage && card.frontArtworkBackgroundMode === 'color' ? (
            <div className="form-field">
              <span className="field-label">Artwork background color</span>
              <div className="inspector-control inspector-control-inline">
                <input
                  type="color"
                  value={card.frontArtworkBackgroundColor}
                  onChange={onChange('frontArtworkBackgroundColor')}
                />
                <code>{card.frontArtworkBackgroundColor}</code>
              </div>
            </div>
          ) : null}

          <div className="form-field">
            <span className="field-label">Front background image</span>
            <input
              id="card-front-background"
              type="file"
              accept="image/*"
              disabled={!frontSurfaceUsesImage}
              onChange={(event) => onImageChange(event, 'frontBackground')}
            />
            {!frontSurfaceUsesImage ? (
              <p className="field-hint">Needs Front Surface mode set to Custom image.</p>
            ) : null}
          </div>

          <div className="form-field">
            <span className="field-label">Back image</span>
            <input
              id="card-back-artwork"
              type="file"
              accept="image/*"
              disabled={!backSurfaceUsesImage}
              onChange={(event) => onImageChange(event, 'back')}
            />
            {!backSurfaceUsesImage ? (
              <p className="field-hint">Needs Back Surface mode set to Custom image.</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab === 'layout' ? (
        <section className="layout-inspector editor-tab-panel" aria-label="Card layout controls">
          <div className="layout-inspector-header">
            <h3>Card Layout</h3>
            <p>Compact controls for frame, panel, and front/back surfaces.</p>
          </div>

          <div className="inspector-group">
            <div className="inspector-group-heading">
              <h4>Frame</h4>
              <span>Magic-style outer edge</span>
            </div>

            <div className="inspector-row">
              <span className="inspector-label">Border</span>
              <div className="inspector-control inspector-control-range">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={card.borderThickness}
                  onChange={onChange('borderThickness')}
                />
                <output className="range-value">{card.borderThickness}px</output>
              </div>
            </div>

            <div className="inspector-row">
              <span className="inspector-label">Border color</span>
              <div className="inspector-control inspector-control-inline">
                <input type="color" value={card.borderColor} onChange={onChange('borderColor')} />
                <code>{card.borderColor}</code>
              </div>
            </div>

            <div className="inspector-row">
              <span className="inspector-label">Frame curve</span>
              <div className="inspector-control inspector-control-range">
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={card.cardFrameCurve}
                  onChange={onChange('cardFrameCurve')}
                />
                <output className="range-value">{card.cardFrameCurve}px</output>
              </div>
            </div>
          </div>

          <div className="inspector-group">
            <div className="inspector-group-heading">
              <h4>Front Artwork</h4>
              <span>Frame around the front art window</span>
            </div>

            <div className="inspector-row">
              <span className="inspector-label">Border</span>
              <div className="inspector-control inspector-control-range">
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={card.frontArtworkBorderThickness}
                  onChange={onChange('frontArtworkBorderThickness')}
                />
                <output className="range-value">{card.frontArtworkBorderThickness}px</output>
              </div>
            </div>

            <div className="inspector-row">
              <span className="inspector-label">Border color</span>
              <div className="inspector-control inspector-control-inline">
                <input
                  type="color"
                  value={card.frontArtworkBorderColor}
                  onChange={onChange('frontArtworkBorderColor')}
                />
                <code>{card.frontArtworkBorderColor}</code>
              </div>
            </div>

            <div className="inspector-row">
              <span className="inspector-label">Frame curve</span>
              <div className="inspector-control inspector-control-range">
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={card.frontArtworkFrameCurve}
                  onChange={onChange('frontArtworkFrameCurve')}
                />
                <output className="range-value">{card.frontArtworkFrameCurve}px</output>
              </div>
            </div>
          </div>

          <div className="inspector-group">
            <div className="inspector-group-heading">
              <h4>Description Box</h4>
              <span>Background tint behind rules text</span>
            </div>

            <div className="inspector-row">
              <span className="inspector-label">Fill color</span>
              <div className="inspector-control inspector-control-inline">
                <input
                  type="color"
                  value={card.descriptionBoxColor}
                  onChange={onChange('descriptionBoxColor')}
                />
                <code>{card.descriptionBoxColor}</code>
              </div>
            </div>

            <div className="inspector-row">
              <span className="inspector-label">Opacity</span>
              <div className="inspector-control inspector-control-range">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={card.descriptionBoxOpacity}
                  onChange={onChange('descriptionBoxOpacity')}
                />
                <output className="range-value">
                  {Math.round(card.descriptionBoxOpacity * 100)}%
                </output>
              </div>
            </div>
          </div>

          <SurfaceInspector
            title="Front Surface"
            description="Card face background"
            mode={card.frontBackgroundMode}
            gradientType={card.frontBackgroundGradientType}
            primaryColor={card.frontBackgroundColor}
            secondaryColor={card.frontBackgroundSecondaryColor}
            onModeChange={onChange('frontBackgroundMode')}
            onGradientTypeChange={onChange('frontBackgroundGradientType')}
            onPrimaryColorChange={onChange('frontBackgroundColor')}
            onSecondaryColorChange={onChange('frontBackgroundSecondaryColor')}
          />

          <SurfaceInspector
            title="Back Surface"
            description="Printed reverse side"
            mode={card.backBackgroundMode}
            gradientType={card.backBackgroundGradientType}
            primaryColor={card.backBackgroundColor}
            secondaryColor={card.backBackgroundSecondaryColor}
            onModeChange={onChange('backBackgroundMode')}
            onGradientTypeChange={onChange('backBackgroundGradientType')}
            onPrimaryColorChange={onChange('backBackgroundColor')}
            onSecondaryColorChange={onChange('backBackgroundSecondaryColor')}
          />
        </section>
      ) : null}

      <div className="form-actions">
        <button type="submit">{isEditing ? 'Update Card' : 'Add Card to Deck'}</button>
        <button type="button" onClick={onResetInputs}>
          Reset Inputs
        </button>
      </div>
    </form>
  )
}

export default CardForm
