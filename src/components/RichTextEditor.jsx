import { useMemo } from 'react'
import { createEditor, Editor, Element as SlateElement, Path, Transforms } from 'slate'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { withHistory } from 'slate-history'
import {
  MdFormatAlignCenter,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdFormatBold,
  MdFormatColorText,
  MdFormatItalic,
  MdFormatUnderlined,
  MdHorizontalRule,
  MdTextDecrease,
  MdTextIncrease,
} from 'react-icons/md'
import {
  RiDeleteColumn,
  RiDeleteRow,
  RiInsertColumnLeft,
  RiInsertColumnRight,
  RiInsertRowTop,
  RiInsertRowBottom,
  RiTableLine,
} from 'react-icons/ri'
import { FONT_OPTIONS, getFontFamily } from '../constants/fonts'

const FONT_SIZE_STEP = 0.1
const MIN_FONT_SCALE = 0.7
const MAX_FONT_SCALE = 1.8
const DEFAULT_FONT_COLOR = '#000000'
const PF2E_ACTION_FONT = 'PF2EActionIcons'
const DEFAULT_TABLE_STYLE = {
  borderColor: '#222222',
  borderOpacity: 0.45,
  borderWidth: 1,
  cellBackgroundColor: '#ffffff',
  cellBackgroundOpacity: 0,
  cellPadding: 4,
}

const PF2E_ACTION_BUTTONS = [
  { label: 'One action', glyph: 'A' },
  { label: 'Two actions', glyph: 'D' },
  { label: 'Three actions', glyph: 'T' },
  { label: 'Reaction', glyph: 'R' },
  { label: 'Free action', glyph: 'F' },
]

const isElementType = (node, type) => SlateElement.isElement(node) && node.type === type

const createParagraphNode = (text = '', align = 'left') => ({
  type: 'paragraph',
  align,
  children: [{ text }],
})

const createDividerNode = () => ({
  type: 'divider',
  children: [{ text: '' }],
})

const createTableCellNode = () => ({
  type: 'table-cell',
  children: [createParagraphNode()],
})

const createTableRowNode = (columns = 2) => ({
  type: 'table-row',
  children: Array.from({ length: columns }, () => createTableCellNode()),
})

const createTableNode = (rows = 2, columns = 2) => ({
  type: 'table',
  ...DEFAULT_TABLE_STYLE,
  children: Array.from({ length: rows }, () => createTableRowNode(columns)),
})

const clampNumber = (value, min, max, fallback) => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return fallback
  return Math.min(Math.max(numericValue, min), max)
}

const toRgba = (hex, alpha) => {
  const normalized = hex.replace('#', '')
  const safeHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized
  const value = Number.parseInt(safeHex, 16)
  const opacity = clampNumber(alpha, 0, 1, 1)

  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${opacity})`
}

const withTables = (editor) => {
  const { isVoid, normalizeNode } = editor

  editor.isVoid = (element) => (isElementType(element, 'divider') ? true : isVoid(element))

  editor.normalizeNode = ([node, path]) => {
    if (isElementType(node, 'table') && node.children.length === 0) {
      Transforms.insertNodes(editor, createTableRowNode(), { at: [...path, 0] })
      return
    }

    if (isElementType(node, 'table-row') && node.children.length === 0) {
      Transforms.insertNodes(editor, createTableCellNode(), { at: [...path, 0] })
      return
    }

    if (isElementType(node, 'table-cell') && node.children.length === 0) {
      Transforms.insertNodes(editor, createParagraphNode(), { at: [...path, 0] })
      return
    }

    normalizeNode([node, path])
  }

  return editor
}

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

const setFontColor = (editor, value) => {
  if (!value || value.toLowerCase() === DEFAULT_FONT_COLOR) {
    Editor.removeMark(editor, 'color')
    return
  }

  Editor.addMark(editor, 'color', value)
}

const insertPf2eActionGlyph = (editor, glyph) => {
  const currentMarks = Editor.marks(editor) ?? {}
  const iconLeaf = {
    text: glyph,
    color: currentMarks.color,
    fontSize: currentMarks.fontSize,
    fontFamily: PF2E_ACTION_FONT,
  }

  Transforms.insertNodes(editor, iconLeaf)
  Editor.removeMark(editor, 'fontFamily')
}

const getActiveAlignment = (editor, defaultAlignment = 'left') => {
  const paragraphEntry = Editor.above(editor, {
    match: (node) => isElementType(node, 'paragraph'),
  })

  return paragraphEntry?.[0]?.align ?? defaultAlignment
}

const setBlockAlignment = (editor, alignment) => {
  Transforms.setNodes(
    editor,
    { align: alignment },
    {
      match: (node) => isElementType(node, 'paragraph'),
      split: true,
    }
  )
}

const getTableContext = (editor) => {
  const cellEntry = Editor.above(editor, { match: (node) => isElementType(node, 'table-cell') })
  const rowEntry = Editor.above(editor, { match: (node) => isElementType(node, 'table-row') })
  const tableEntry = Editor.above(editor, { match: (node) => isElementType(node, 'table') })

  if (!cellEntry || !rowEntry || !tableEntry) {
    return null
  }

  return {
    cellEntry,
    rowEntry,
    tableEntry,
  }
}

const getSelectedTableEntry = (editor) =>
  Editor.above(editor, { match: (node) => isElementType(node, 'table') })

const updateSelectedTableStyle = (editor, updates) => {
  const tableEntry = getSelectedTableEntry(editor)
  if (!tableEntry) return

  const [, tablePath] = tableEntry
  Transforms.setNodes(editor, updates, { at: tablePath })
}

const insertTable = (editor) => {
  Transforms.insertNodes(editor, createTableNode())

  const [tableEntry] = Editor.nodes(editor, {
    at: [],
    match: (node) => isElementType(node, 'table'),
    reverse: true,
  })

  if (!tableEntry) return

  const [, tablePath] = tableEntry
  const firstParagraphPath = [...tablePath, 0, 0, 0]
  const start = Editor.start(editor, firstParagraphPath)
  Transforms.select(editor, { anchor: start, focus: start })
}

const insertDivider = (editor) => {
  const currentBlockEntry = Editor.above(editor, {
    match: (node) => SlateElement.isElement(node) && Editor.isBlock(editor, node),
  })
  const insertionPath = currentBlockEntry ? Path.next(currentBlockEntry[1]) : [editor.children.length]
  const nextParagraphPath = Path.next(insertionPath)

  Transforms.insertNodes(editor, [createDividerNode(), createParagraphNode()], { at: insertionPath })

  const start = Editor.start(editor, nextParagraphPath)
  Transforms.select(editor, { anchor: start, focus: start })
}

const addTableRow = (editor, position = 'below') => {
  const context = getTableContext(editor)
  if (!context) return

  const [rowNode, rowPath] = context.rowEntry
  const targetPath = position === 'above' ? rowPath : Path.next(rowPath)

  Transforms.insertNodes(editor, createTableRowNode(rowNode.children.length), {
    at: targetPath,
  })
}

const removeTableRow = (editor) => {
  const context = getTableContext(editor)
  if (!context) return

  const [tableNode, tablePath] = context.tableEntry
  const [, rowPath] = context.rowEntry

  if (tableNode.children.length <= 1) {
    Transforms.removeNodes(editor, { at: tablePath })
    return
  }

  Transforms.removeNodes(editor, { at: rowPath })
}

const addTableColumn = (editor, position = 'right') => {
  const context = getTableContext(editor)
  if (!context) return

  const [tableNode, tablePath] = context.tableEntry
  const [, cellPath] = context.cellEntry
  const columnIndex = cellPath[cellPath.length - 1]
  const insertionIndex = position === 'left' ? columnIndex : columnIndex + 1

  tableNode.children.forEach((_, rowIndex) => {
    Transforms.insertNodes(editor, createTableCellNode(), {
      at: [...tablePath, rowIndex, insertionIndex],
    })
  })
}

const removeTableColumn = (editor) => {
  const context = getTableContext(editor)
  if (!context) return

  const [tableNode, tablePath] = context.tableEntry
  const [, rowPath] = context.rowEntry
  const [, cellPath] = context.cellEntry
  const columnIndex = cellPath[cellPath.length - 1]
  const currentRowNode = rowPath ? tableNode.children[rowPath[rowPath.length - 1]] : null

  if (!currentRowNode) return

  if (currentRowNode.children.length <= 1) {
    Transforms.removeNodes(editor, { at: tablePath })
    return
  }

  for (let rowIndex = tableNode.children.length - 1; rowIndex >= 0; rowIndex -= 1) {
    Transforms.removeNodes(editor, {
      at: [...tablePath, rowIndex, columnIndex],
    })
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

function FontColorControl() {
  const editor = useSlate()
  const selectedColor = Editor.marks(editor)?.color ?? DEFAULT_FONT_COLOR

  return (
    <div className="rich-text-color-control">
      <span>Color</span>
      <label className="rich-text-color-input" aria-label="Font color">
        <MdFormatColorText />
        <input
          type="color"
          value={selectedColor}
          onChange={(event) => setFontColor(editor, event.target.value)}
        />
      </label>
    </div>
  )
}

function AlignmentControls({ defaultAlignment }) {
  const editor = useSlate()
  const activeAlignment = getActiveAlignment(editor, defaultAlignment)

  return (
    <div className="rich-text-alignment-controls">
      <ToolbarButton label="Align left" onMouseDown={() => setBlockAlignment(editor, 'left')}>
        <MdFormatAlignLeft className={activeAlignment === 'left' ? 'is-active' : undefined} />
      </ToolbarButton>
      <ToolbarButton label="Align center" onMouseDown={() => setBlockAlignment(editor, 'center')}>
        <MdFormatAlignCenter className={activeAlignment === 'center' ? 'is-active' : undefined} />
      </ToolbarButton>
      <ToolbarButton label="Align right" onMouseDown={() => setBlockAlignment(editor, 'right')}>
        <MdFormatAlignRight className={activeAlignment === 'right' ? 'is-active' : undefined} />
      </ToolbarButton>
    </div>
  )
}

function TableControls() {
  const editor = useSlate()
  const tableEntry = getSelectedTableEntry(editor)
  const selectedTableStyle = tableEntry?.[0]

  return (
    <div className="rich-text-table-controls">
      <ToolbarButton label="Insert table" onMouseDown={() => insertTable(editor)}>
        <RiTableLine />
      </ToolbarButton>
      {selectedTableStyle ? (
        <>
          <ToolbarButton label="Insert row above" onMouseDown={() => addTableRow(editor, 'above')}>
            <RiInsertRowTop />
          </ToolbarButton>
          <ToolbarButton label="Insert row below" onMouseDown={() => addTableRow(editor, 'below')}>
            <RiInsertRowBottom />
          </ToolbarButton>
          <ToolbarButton label="Remove row" onMouseDown={() => removeTableRow(editor)}>
            <RiDeleteRow />
          </ToolbarButton>
          <ToolbarButton
            label="Insert column left"
            onMouseDown={() => addTableColumn(editor, 'left')}
          >
            <RiInsertColumnLeft />
          </ToolbarButton>
          <ToolbarButton
            label="Insert column right"
            onMouseDown={() => addTableColumn(editor, 'right')}
          >
            <RiInsertColumnRight />
          </ToolbarButton>
          <ToolbarButton label="Remove column" onMouseDown={() => removeTableColumn(editor)}>
            <RiDeleteColumn />
          </ToolbarButton>
          <div className="rich-text-table-style-controls">
            <label className="rich-text-inline-control">
              <span>Line</span>
              <input
                type="color"
                value={selectedTableStyle.borderColor ?? DEFAULT_TABLE_STYLE.borderColor}
                onChange={(event) =>
                  updateSelectedTableStyle(editor, { borderColor: event.target.value })
                }
              />
            </label>
            <label className="rich-text-inline-control rich-text-inline-control-range">
              <span>Line α</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedTableStyle.borderOpacity ?? DEFAULT_TABLE_STYLE.borderOpacity}
                onChange={(event) =>
                  updateSelectedTableStyle(editor, {
                    borderOpacity: clampNumber(
                      event.target.value,
                      0,
                      1,
                      DEFAULT_TABLE_STYLE.borderOpacity
                    ),
                  })
                }
              />
              <output>
                {Math.round(
                  (selectedTableStyle.borderOpacity ?? DEFAULT_TABLE_STYLE.borderOpacity) * 100
                )}
                %
              </output>
            </label>
            <label className="rich-text-inline-control rich-text-inline-control-range">
              <span>Line px</span>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={selectedTableStyle.borderWidth ?? DEFAULT_TABLE_STYLE.borderWidth}
                onChange={(event) =>
                  updateSelectedTableStyle(editor, {
                    borderWidth: clampNumber(
                      event.target.value,
                      0,
                      4,
                      DEFAULT_TABLE_STYLE.borderWidth
                    ),
                  })
                }
              />
              <output>{selectedTableStyle.borderWidth ?? DEFAULT_TABLE_STYLE.borderWidth}px</output>
            </label>
            <label className="rich-text-inline-control">
              <span>Fill</span>
              <input
                type="color"
                value={
                  selectedTableStyle.cellBackgroundColor ?? DEFAULT_TABLE_STYLE.cellBackgroundColor
                }
                onChange={(event) =>
                  updateSelectedTableStyle(editor, { cellBackgroundColor: event.target.value })
                }
              />
            </label>
            <label className="rich-text-inline-control rich-text-inline-control-range">
              <span>Fill α</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={
                  selectedTableStyle.cellBackgroundOpacity ??
                  DEFAULT_TABLE_STYLE.cellBackgroundOpacity
                }
                onChange={(event) =>
                  updateSelectedTableStyle(editor, {
                    cellBackgroundOpacity: clampNumber(
                      event.target.value,
                      0,
                      1,
                      DEFAULT_TABLE_STYLE.cellBackgroundOpacity
                    ),
                  })
                }
              />
              <output>
                {Math.round(
                  (selectedTableStyle.cellBackgroundOpacity ??
                    DEFAULT_TABLE_STYLE.cellBackgroundOpacity) * 100
                )}
                %
              </output>
            </label>
            <label className="rich-text-inline-control rich-text-inline-control-range">
              <span>Pad</span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={selectedTableStyle.cellPadding ?? DEFAULT_TABLE_STYLE.cellPadding}
                onChange={(event) =>
                  updateSelectedTableStyle(editor, {
                    cellPadding: clampNumber(
                      event.target.value,
                      0,
                      10,
                      DEFAULT_TABLE_STYLE.cellPadding
                    ),
                  })
                }
              />
              <output>{selectedTableStyle.cellPadding ?? DEFAULT_TABLE_STYLE.cellPadding}px</output>
            </label>
          </div>
        </>
      ) : null}
    </div>
  )
}

function DividerControl() {
  const editor = useSlate()

  return (
    <ToolbarButton label="Insert horizontal divider" onMouseDown={() => insertDivider(editor)}>
      <MdHorizontalRule />
    </ToolbarButton>
  )
}

function Pf2eActionControls() {
  const editor = useSlate()

  return (
    <div className="rich-text-pf2e-controls">
      {PF2E_ACTION_BUTTONS.map((actionButton) => (
        <ToolbarButton
          key={actionButton.label}
          label={actionButton.label}
          onMouseDown={() => insertPf2eActionGlyph(editor, actionButton.glyph)}
        >
          <span className="pf2e-action-icon rich-text-toolbar-glyph">{actionButton.glyph}</span>
        </ToolbarButton>
      ))}
    </div>
  )
}

function Element({ attributes, children, element, defaultAlignment }) {
  switch (element.type) {
    case 'divider':
      return (
        <div {...attributes} className="rich-text-divider">
          <div contentEditable={false}>
            <hr />
          </div>
          {children}
        </div>
      )
    case 'table':
      return (
        <div
          {...attributes}
          className="rich-text-table"
          style={{
            '--editor-table-border-color': toRgba(
              element.borderColor ?? DEFAULT_TABLE_STYLE.borderColor,
              element.borderOpacity ?? DEFAULT_TABLE_STYLE.borderOpacity
            ),
            '--editor-table-border-width': `${element.borderWidth ?? DEFAULT_TABLE_STYLE.borderWidth}px`,
            '--editor-table-cell-bg': toRgba(
              element.cellBackgroundColor ?? DEFAULT_TABLE_STYLE.cellBackgroundColor,
              element.cellBackgroundOpacity ?? DEFAULT_TABLE_STYLE.cellBackgroundOpacity
            ),
            '--editor-table-cell-padding': `${element.cellPadding ?? DEFAULT_TABLE_STYLE.cellPadding}px`,
          }}
        >
          {children}
        </div>
      )
    case 'table-row':
      return <div {...attributes} className="rich-text-table-row">{children}</div>
    case 'table-cell':
      return <div {...attributes} className="rich-text-table-cell">{children}</div>
    case 'paragraph':
    default:
      return <p {...attributes} style={{ textAlign: element.align ?? defaultAlignment }}>{children}</p>
  }
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
        color: leaf.color ?? undefined,
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
  enableTables = false,
  defaultAlignment = 'left',
}) {
  const editor = useMemo(() => withTables(withHistory(withReact(createEditor()))), [])

  return (
    <div className={`rich-text-editor ${compact ? 'compact' : ''}`}>
      <Slate editor={editor} initialValue={value} value={value} onChange={onChange}>
        <div className="rich-text-toolbar">
          <AlignmentControls defaultAlignment={defaultAlignment} />
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
          <Pf2eActionControls />
          {!singleLine ? <DividerControl /> : null}
          {enableTables ? <TableControls /> : null}
          <FontColorControl />
          <FontFamilySelect />
        </div>
        <Editable
          className={`rich-text-editable${enableTables ? ' has-tables' : ''}`}
          renderElement={(props) => <Element {...props} defaultAlignment={defaultAlignment} />}
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
