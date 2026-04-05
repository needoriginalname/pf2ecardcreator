import { createEmptyRichTextValue } from '../../utils/richText.jsx'

export const GENERIC_TEMPLATE_ID = 'generic'
export const TEMPLATE_DEFINITION_KIND = 'pf2e-card-template'
export const TEMPLATE_DEFINITION_VERSION = 1

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

export const createTemplateCard = (overrides = {}) => ({
  templateId: GENERIC_TEMPLATE_ID,
  name: createEmptyRichTextValue('left'),
  backTitle: createEmptyRichTextValue('center'),
  traits: createEmptyRichTextValue('center'),
  actionCustom: createEmptyRichTextValue('right'),
  description: createEmptyRichTextValue('left'),
  frontArtworkText: createEmptyRichTextValue('left'),
  details: '',
  image: '',
  frontArtworkLayout: 'art-only',
  frontArtworkBackgroundMode: 'transparent',
  frontArtworkBackgroundColor: '#ffffff',
  frontArtworkBorderThickness: 1,
  frontArtworkBorderColor: '#444444',
  cardFrameCurve: 10,
  frontArtworkFrameCurve: 6,
  imageBack: '',
  frontBackgroundImage: '',
  borderThickness: 1,
  borderColor: '#333333',
  backTitleBoxColor: '#ffffff',
  backTitleBoxOpacity: 0.84,
  descriptionBoxColor: '#ffffff',
  descriptionBoxOpacity: 0.82,
  descriptionBoxBorderThickness: 0,
  descriptionBoxBorderColor: '#333333',
  descriptionBoxFrameCurve: 6,
  descriptionBoxMargin: 0,
  descriptionBoxPadding: 6,
  traitsBoxColor: '#ffffff',
  traitsBoxOpacity: 0,
  traitsBoxBorderThickness: 0,
  traitsBoxBorderColor: '#333333',
  traitsBoxFrameCurve: 6,
  traitsBoxMargin: 0,
  traitsBoxPadding: 0,
  frontBackgroundMode: 'solid',
  frontBackgroundGradientType: 'linear',
  frontBackgroundColor: '#feffff',
  frontBackgroundSecondaryColor: '#dce4f0',
  backBackgroundMode: 'solid',
  backBackgroundGradientType: 'linear',
  backBackgroundColor: '#feffff',
  backBackgroundSecondaryColor: '#dce4f0',
  ...overrides,
})

export const createTemplateDefinition = ({
  id,
  label,
  description,
  starterCard,
}) => ({
  kind: TEMPLATE_DEFINITION_KIND,
  version: TEMPLATE_DEFINITION_VERSION,
  template: {
    id,
    label,
    description,
    starterCard,
  },
})
