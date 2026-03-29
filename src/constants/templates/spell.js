import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  paragraph,
  templateDescriptionParagraphs,
} from './helpers'

const spellTemplate = {
	"kind": "pf2e-card-template",
	"version": 1,
	"template": {
		"id": "spell",
    "label": "Spell",
    "description": "Example of a spell template.",
		"placeholders": {
			"name": "Fireball",
			"traits": "Concentrate, Fire, Manipulate",
			"action": "Spell 3",
			"description": "A roaring blast of fire detonates at a spot you designate, dealing 6d6 fire damage. Heightened (+1) Increase the damage by 2d6.",
			"artSide": "Traditions arcana, primal Action D Range 500 feet Area 20-foot burst Defense Basic Reflex"
		},
		"starterCard": {
			"templateId": "spell",
			"name": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Fireball "
						}
					]
				}
			],
			"traits": [
				{
					"type": "paragraph",
					"align": "center",
					"children": [
						{
							"text": "Concentrate, Fire, Manipulate"
						}
					]
				}
			],
			"actionCustom": [
				{
					"type": "paragraph",
					"align": "right",
					"children": [
						{
							"text": "Spell 3"
						}
					]
				}
			],
			"school": "Evocation",
			"description": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "A roaring blast of fire detonates at a spot you designate, dealing 6d6 fire damage."
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": ""
						}
					]
				},
				{
					"type": "divider",
					"children": [
						{
							"text": ""
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": ""
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Heightened (+1) ",
							"bold": true
						},
						{
							"text": "Increase the damage by 2d6."
						}
					]
				}
			],
			"frontArtworkText": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "",
							"bold": true
						}
					]
				},
				{
					"type": "table",
					"borderColor": "#222222",
					"borderOpacity": 0.45,
					"borderWidth": 0,
					"cellBackgroundColor": "#ffffff",
					"cellBackgroundOpacity": 0,
					"cellPadding": 4,
					"children": [
						{
							"type": "table-row",
							"children": [
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "right",
											"children": [
												{
													"text": "Traditions"
												}
											]
										}
									]
								},
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "left",
											"children": [
												{
													"text": "arcana, primal"
												}
											]
										}
									]
								}
							]
						},
						{
							"type": "table-row",
							"children": [
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "right",
											"children": [
												{
													"text": "Action"
												}
											]
										}
									]
								},
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "left",
											"children": [
												{
													"text": "D",
													"fontFamily": "PF2EActionIcons"
												}
											]
										}
									]
								}
							]
						},
						{
							"type": "table-row",
							"children": [
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "right",
											"children": [
												{
													"text": "Range"
												}
											]
										}
									]
								},
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "left",
											"children": [
												{
													"text": "500 feet"
												}
											]
										}
									]
								}
							]
						},
						{
							"type": "table-row",
							"children": [
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "right",
											"children": [
												{
													"text": "Area"
												}
											]
										}
									]
								},
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "left",
											"children": [
												{
													"text": "20-foot burst"
												}
											]
										}
									]
								}
							]
						},
						{
							"type": "table-row",
							"children": [
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "right",
											"children": [
												{
													"text": "Defense"
												}
											]
										}
									]
								},
								{
									"type": "table-cell",
									"children": [
										{
											"type": "paragraph",
											"align": "left",
											"children": [
												{
													"text": "Basic Reflex"
												}
											]
										}
									]
								}
							]
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": ""
						}
					]
				}
			],
			"details": "",
			"image": "",
			"frontArtworkLayout": "art-left-text-right",
			"frontArtworkBackgroundMode": "transparent",
			"frontArtworkBackgroundColor": "#ffffff",
			"frontArtworkBorderThickness": 1,
			"frontArtworkBorderColor": "#444444",
			"cardFrameCurve": 10,
			"frontArtworkFrameCurve": 6,
			"imageBack": "",
			"frontBackgroundImage": "",
			"borderThickness": 1,
			"borderColor": "#333333",
			"descriptionBoxColor": "#ffffff",
			"descriptionBoxOpacity": 0.82,
			"frontBackgroundMode": "solid",
			"frontBackgroundGradientType": "linear",
			"frontBackgroundColor": "#feffff",
			"frontBackgroundSecondaryColor": "#dce4f0",
			"backBackgroundMode": "solid",
			"backBackgroundGradientType": "linear",
			"backBackgroundColor": "#feffff",
			"backBackgroundSecondaryColor": "#dce4f0"
		}
	}
}

export default spellTemplate
