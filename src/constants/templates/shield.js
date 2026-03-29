import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  paragraph,
  templateDescriptionParagraphs,
} from './helpers'

const shieldTemplate = {
	"kind": "pf2e-card-template",
	"version": 1,
	"template": {
		"id": "shield",
		"label": "Item: Shield",
		"description": "Custom template based on Steel Shield.",
		"starterCard": {
			"templateId": "shield",
			"name": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Steel Shield"
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
							"text": "Shield"
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
							"text": "Shield"
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
							"text": "Like wooden shields, steel shields come in a variety of shapes and sizes. Though more expensive than wooden shields, steel shields are more durable."
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
													"text": "2 gp"
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
													"text": "AC Bonus",
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
													"text": "+2"
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
													"text": "Speed Penalty ",
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
													"text": "- "
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
													"text": "Hardness",
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
													"text": "5"
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
													"text": "HP",
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
													"text": "20"
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
													"text": "BT",
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
													"text": "10"
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

export default shieldTemplate
