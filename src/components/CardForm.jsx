import { useState } from 'react'
import RichTextEditor from './RichTextEditor'

const GRADIENT_OPTIONS = [
  { value: 'linear', label: 'Diagonal' },
  { value: 'diagonal-reverse', label: 'Diagonal reverse' },
  { value: 'top-bottom', label: 'Top to bottom' },
  { value: 'left-right', label: 'Left to right' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
]

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
  editorSessionKey,
  formId,
  isEditing,
  onActionTextChange,
  onChange,
  onDescriptionChange,
  onImageChange,
  onNameChange,
  onResetInputs,
  onSubmit,
  onTraitsChange,
}) {
  const [activeTab, setActiveTab] = useState('text')
  const frontSurfaceUsesImage = card.frontBackgroundMode === 'image'
  const backSurfaceUsesImage = card.backBackgroundMode === 'image'

  return (
    <form id={formId} className="card-form" onSubmit={onSubmit} aria-label="Card editor">
      <div className="editor-tabs" role="tablist" aria-label="Card editor sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'text'}
          className={activeTab === 'text' ? 'active' : ''}
          onClick={() => setActiveTab('text')}
        >
          Text Fields
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'images'}
          className={activeTab === 'images' ? 'active' : ''}
          onClick={() => setActiveTab('images')}
        >
          Images
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'layout'}
          className={activeTab === 'layout' ? 'active' : ''}
          onClick={() => setActiveTab('layout')}
        >
          Card Layout
        </button>
      </div>

      {activeTab === 'text' ? (
        <section className="editor-tab-panel" role="tabpanel" aria-label="Text fields">
          <div className="form-field">
            <span className="field-label">Name</span>
            <RichTextEditor
              key={`name-${editorSessionKey}`}
              value={card.name}
              onChange={onNameChange}
              placeholder="Fireball"
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
              placeholder="Evocation, Fire"
              compact
              singleLine
            />
          </div>

          <div className="form-field">
            <span className="field-label">Action symbol:</span>
            <select id="card-action-icon" value={card.actionIcon} onChange={onChange('actionIcon')}>
              <option value="">None</option>
              <option value="A">One action</option>
              <option value="D">Two actions</option>
              <option value="T">Three actions</option>
              <option value="R">Reaction</option>
              <option value="F">Free action</option>
            </select>
          </div>

          <div className="form-field">
            <span className="field-label">Custom action text</span>
            <RichTextEditor
              key={`action-${editorSessionKey}`}
              value={card.actionCustom}
              onChange={onActionTextChange}
              placeholder="e.g. 1 action, Immediate"
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
              placeholder="Effect text"
            />
          </div>
        </section>
      ) : null}

      {activeTab === 'images' ? (
        <section className="editor-tab-panel" role="tabpanel" aria-label="Image fields">
          <div className="form-field">
            <span className="field-label">Front artwork</span>
            <input
              id="card-artwork"
              type="file"
              accept="image/*"
              onChange={(event) => onImageChange(event, 'front')}
            />
          </div>

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
