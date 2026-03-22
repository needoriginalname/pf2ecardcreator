import { getFontFamily } from '../constants/fonts'

export const initialRichTextValue = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

export const createEmptyRichTextValue = () =>
  initialRichTextValue.map((node) => ({
    ...node,
    children: node.children.map((child) => ({ ...child })),
  }))

export const isRichTextEmpty = (value) =>
  !value?.some((node) => node.children?.some((child) => child.text?.trim()))

export const getRichTextPlainText = (value) =>
  value
    ?.flatMap((node) => node.children ?? [])
    .map((child) => child.text ?? '')
    .join(' ')
    .trim() ?? ''

const renderLeafText = (leaf, leafIndex) => (
  <span
    key={leafIndex}
    style={{
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

export const renderRichText = (value) =>
  value?.map((node, index) => (
    <p key={index}>{node.children?.map((leaf, leafIndex) => renderLeafText(leaf, leafIndex))}</p>
  ))

export const renderInlineRichText = (value) =>
  value?.map((node, index) => (
    <span key={index}>
      {node.children?.map((leaf, leafIndex) => renderLeafText(leaf, leafIndex))}
      {index < value.length - 1 ? ' ' : null}
    </span>
  ))
