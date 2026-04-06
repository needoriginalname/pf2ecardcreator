import {
  createCenteredEmptyValue,
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  paragraph,
  templateDescriptionParagraphs,
} from './helpers'

const adventuringGearTemplate = {
	"kind": "pf2e-card-template",
	"version": 1,
	"template": {
		"id": "adventuring-gear",
		"label": "Item: Adventuring Gear",
		"description": "Custom template based on Minor Healing Potion.",
		"starterCard": {
			"templateId": "adventuring-gear",
			"name": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Minor Healing Potion"
						}
					]
				}
			],
			"backTitle": [
				{
					"type": "paragraph",
					"align": "center",
					"children": [
						{
							"text": ""
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
							"text": "Consumable, Healing, Magical, Potion, Vitality"
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
							"text": "Item 1"
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
							"text": "A healing potion is a vial of a ruby-red liquid that imparts a tingling sensation as the drinker's wounds heal rapidly. When you drink a healing potion, you regain 1d8 Hit Points."
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
							"text": ""
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
													"text": "Usage",
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
													"text": "Held in 1 Hand"
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
													"text": "L"
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
													"text": "Activate",
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
													"text": "A",
													"fontFamily": "PF2EActionIcons"
												},
												{
													"text": " (manipulate)"
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
													"text": "4gp"
												}
											]
										}
									]
								}
							]
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
			"backTitleBoxColor": "#ffffff",
			"backTitleBoxOpacity": 0.84,
			"descriptionBoxColor": "#ffffff",
			"descriptionBoxOpacity": 0.82,
			"descriptionBoxBorderThickness": 0,
			"descriptionBoxBorderColor": "#333333",
			"descriptionBoxFrameCurve": 6,
			"descriptionBoxMargin": 0,
			"descriptionBoxPadding": 6,
			"traitsBoxColor": "#ffffff",
			"traitsBoxOpacity": 0,
			"traitsBoxBorderThickness": 0,
			"traitsBoxBorderColor": "#333333",
			"traitsBoxFrameCurve": 6,
			"traitsBoxMargin": 0,
			"traitsBoxPadding": 0,
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

export default adventuringGearTemplate
