import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  paragraph,
  templateDescriptionParagraphs,
} from './helpers'

const weaponTemplate = {
	"kind": "pf2e-card-template",
	"version": 1,
	"template": {
		"id": "weapon",
		"label": "Item: Weapon",
		"description": "Custom template based on Longsword.",
		"starterCard": {
			"templateId": "weapon",
			"name": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Longsword"
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
							"text": "Versatile P"
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
							"text": "Weapon"
						}
					]
				}
			],
			"description": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Longswords can be one-edged or two-edged swords. Their blades are heavy and they're between 3 and 4 feet in length."
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
							"text": "Critical Specialization: ",
							"bold": true
						},
						{
							"text": "Sword "
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "The target is made off-guard until the start of your next turn."
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
													"text": "Price",
													"bold": true
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
													"text": "1 gp"
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
													"text": "Damage",
													"bold": true
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
													"text": "1d8 S"
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
													"text": "Hands",
													"bold": true
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
													"text": "1"
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
													"text": "Bulk",
													"bold": true
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
													"text": "1"
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
													"text": "Type",
													"bold": true
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
													"text": "Melee"
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
													"text": "Category",
													"bold": true
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
													"text": "Martial"
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
													"text": "Group",
													"bold": true
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
													"text": "Sword"
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

export default weaponTemplate
