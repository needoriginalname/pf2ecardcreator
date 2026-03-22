import { useMemo } from 'react'
import { createEditor, Editor } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdTextDecrease,
  MdTextIncrease,
} from 'react-icons/md'
import { FONT_OPTIONS, getFontFamily } from '../constants/fonts'

const FONT_SIZE_STEP = 0.1
const MIN_FONT_SCALE = 0.7
const MAX_FONT_SCALE = 1.8

const isMarkActive = (editor, format, expectedValue = true) => {
  const marks = Editor.marks(editor)
  return expectedValue === true ? marks?.[format] === true : marks?.[format] === expectedValue
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const setFontFamily = (editor, value) => {
  if (!value || value === 'Default') {
    Editor.removeMark(editor, 'fontFamily')
    return
  }

  Editor.addMark(editor, 'fontFamily', value)
}

const adjustFontScale = (editor, direction) => {
  const currentScale = Number(Editor.marks(editor)?.fontSize ?? 1)
  const nextScale = Math.min(
    MAX_FONT_SCALE,
    Math.max(MIN_FONT_SCALE, currentScale + direction * FONT_SIZE_STEP)
  )

  if (nextScale === 1) {
    Editor.removeMark(editor, 'fontSize')
  } else {
    Editor.addMark(editor, 'fontSize', Number(nextScale.toFixed(2)))
  }
}

function ToolbarButton({ label, onMouseDown, children }) {
  return (
    <button
      type="button"
      className="rich-text-toolbar-button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault()
        onMouseDown()
      }}
    >
      {children}
    </button>
  )
}

function FontFamilySelect() {
  const editor = useSlate()
  const selectedFont = Editor.marks(editor)?.fontFamily ?? 'Default'

  return (
    <div className="rich-text-font-control">
      <span>Font</span>
      <select
        className="rich-text-toolbar-select"
        value={selectedFont}
        onChange={(event) => setFontFamily(editor, event.target.value)}
      >
        {FONT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
    </div>
  )
}

function Leaf({ attributes, children, leaf }) {
  let nextChildren = children

  if (leaf.bold) {
    nextChildren = <strong>{nextChildren}</strong>
  }

  if (leaf.italic) {
    nextChildren = <em>{nextChildren}</em>
  }

  if (leaf.underline) {
    nextChildren = <u>{nextChildren}</u>
  }

  return (
    <span
      {...attributes}
      style={{
        fontFamily: leaf.fontFamily ? getFontFamily(leaf.fontFamily) : undefined,
        fontSize: `${leaf.fontSize ?? 1}em`,
      }}
    >
      {nextChildren}
    </span>
  )
}

function RichTextEditor({
  value,
  onChange,
  placeholder = 'Effect text',
  compact = false,
  singleLine = false,
}) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  return (
    <div className={`rich-text-editor ${compact ? 'compact' : ''}`}>
      <Slate editor={editor} initialValue={value} value={value} onChange={onChange}>
        <div className="rich-text-toolbar">
          <ToolbarButton label="Bold" onMouseDown={() => toggleMark(editor, 'bold')}>
            <MdFormatBold />
          </ToolbarButton>
          <ToolbarButton label="Italic" onMouseDown={() => toggleMark(editor, 'italic')}>
            <MdFormatItalic />
          </ToolbarButton>
          <ToolbarButton label="Underline" onMouseDown={() => toggleMark(editor, 'underline')}>
            <MdFormatUnderlined />
          </ToolbarButton>
          <ToolbarButton label="Decrease font size" onMouseDown={() => adjustFontScale(editor, -1)}>
            <MdTextDecrease />
          </ToolbarButton>
          <ToolbarButton label="Increase font size" onMouseDown={() => adjustFontScale(editor, 1)}>
            <MdTextIncrease />
          </ToolbarButton>
          <FontFamilySelect />
        </div>
        <Editable
          className="rich-text-editable"
          renderLeaf={(props) => <Leaf {...props} />}
          placeholder={placeholder}
          spellCheck
          autoFocus={false}
          onKeyDown={(event) => {
            if (singleLine && event.key === 'Enter') {
              event.preventDefault()
            }
          }}
        />
      </Slate>
    </div>
  )
}

export default RichTextEditor
