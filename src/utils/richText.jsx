import { getFontFamily } from '../constants/fonts'

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

const DEFAULT_TABLE_STYLE = {
  borderColor: '#222222',
  borderOpacity: 0.45,
  borderWidth: 1,
  cellBackgroundColor: '#ffffff',
  cellBackgroundOpacity: 0,
  cellPadding: 4,
}

const createParagraphNode = (align = 'left') => ({
  type: 'paragraph',
  align,
  children: [{ text: '' }],
})

export const initialRichTextValue = [createParagraphNode()]

export const createEmptyRichTextValue = (align = 'left') => [createParagraphNode(align)]

const nodeHasText = (node) => {
  if (!node) return false

  if (typeof node.text === 'string') {
    return Boolean(node.text.trim())
  }

  return node.children?.some(nodeHasText) ?? false
}

const getNodeText = (node) => {
  if (!node) return ''

  if (typeof node.text === 'string') {
    return node.text
  }

  return (node.children ?? []).map(getNodeText).join(' ').trim()
}

export const isRichTextEmpty = (value) => !value?.some(nodeHasText)

export const getRichTextPlainText = (value) =>
  value?.map(getNodeText).join(' ').replace(/\s+/g, ' ').trim() ?? ''

const renderLeafText = (leaf, leafIndex) => (
  <span
    key={leafIndex}
    style={{
      color: leaf.color ?? undefined,
      fontFamily: leaf.fontFamily ? getFontFamily(leaf.fontFamily) : undefined,
      fontSize: `${leaf.fontSize ?? 1}em`,
      fontWeight: leaf.bold ? 700 : 400,
      fontStyle: leaf.italic ? 'italic' : 'normal',
      textDecoration: leaf.underline ? 'underline' : 'none',
    }}
  >
    {leaf.text}
  </span>
)

const getNodeAlignment = (node, fallbackAlign = 'left') => node?.align ?? fallbackAlign

const renderRichTextNode = (node, key, fallbackAlign = 'left') => {
  if (!node) return null

  switch (node.type) {
    case 'divider':
      return <hr key={key} className="rich-text-render-divider" />
    case 'table':
      return (
        <table
          key={key}
          className="rich-text-render-table"
          style={{
            borderColor: toRgba(
              node.borderColor ?? DEFAULT_TABLE_STYLE.borderColor,
              node.borderOpacity ?? DEFAULT_TABLE_STYLE.borderOpacity
            ),
            borderWidth: `${node.borderWidth ?? DEFAULT_TABLE_STYLE.borderWidth}px`,
            '--table-cell-bg': toRgba(
              node.cellBackgroundColor ?? DEFAULT_TABLE_STYLE.cellBackgroundColor,
              node.cellBackgroundOpacity ?? DEFAULT_TABLE_STYLE.cellBackgroundOpacity
            ),
            '--table-cell-border-color': toRgba(
              node.borderColor ?? DEFAULT_TABLE_STYLE.borderColor,
              node.borderOpacity ?? DEFAULT_TABLE_STYLE.borderOpacity
            ),
            '--table-cell-border-width': `${node.borderWidth ?? DEFAULT_TABLE_STYLE.borderWidth}px`,
            '--table-cell-padding': `${node.cellPadding ?? DEFAULT_TABLE_STYLE.cellPadding}px`,
          }}
        >
          <tbody>
            {node.children?.map((row, rowIndex) =>
              renderRichTextNode(row, `${key}-row-${rowIndex}`, fallbackAlign)
            )}
          </tbody>
        </table>
      )
    case 'table-row':
      return (
        <tr key={key}>
          {node.children?.map((cell, cellIndex) =>
            renderRichTextNode(cell, `${key}-cell-${cellIndex}`, fallbackAlign)
          )}
        </tr>
      )
    case 'table-cell':
      return (
        <td key={key}>
          {node.children?.map((child, childIndex) =>
            renderRichTextNode(child, `${key}-child-${childIndex}`, fallbackAlign)
          )}
        </td>
      )
    case 'paragraph':
    default:
      return (
        <p key={key} style={{ textAlign: getNodeAlignment(node, fallbackAlign) }}>
          {node.children?.map((leaf, leafIndex) => renderLeafText(leaf, leafIndex))}
        </p>
      )
  }
}

export const renderRichText = (value, fallbackAlign = 'left') =>
  value?.map((node, index) => renderRichTextNode(node, `node-${index}`, fallbackAlign))

export const renderInlineRichText = (value, fallbackAlign = 'left') =>
  value?.map((node, index) => (
    <span
      key={index}
      className="rich-text-inline-node"
      style={{ textAlign: getNodeAlignment(node, fallbackAlign) }}
    >
      {node.children?.map((leaf, leafIndex) => renderLeafText(leaf, leafIndex))}
      {index < value.length - 1 ? ' ' : null}
    </span>
  ))
