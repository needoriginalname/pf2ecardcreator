import { createEmptyRichTextValue } from '../../utils/richText.jsx'

export const GENERIC_TEMPLATE_ID = 'generic'

export const leaf = (text, marks = {}) => ({ text, ...marks })

export const paragraph = (children, align = 'left') => ({
  type: 'paragraph',
  align,
  children: Array.isArray(children) ? children : [leaf(children)],
})

export const inlineValue = (text, align = 'left') => [paragraph([leaf(text)], align)]

export const labeledParagraph = (label, value = '') =>
  paragraph([leaf(`${label} `, { bold: true }), leaf(value)])

export const templateDescriptionParagraphs = (...rows) =>
  rows.map(([label, value]) => labeledParagraph(label, value))

export const createCenteredEmptyValue = () => createEmptyRichTextValue('center')
