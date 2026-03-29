import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  templateDescriptionParagraphs,
} from './helpers'

const hazardTemplate = {
	"kind": "pf2e-card-template",
	"version": 1,
	"template": {
		"id": "hazard",
		"label": "Hazard",
		"description": "Custom template based on Spear Launcher.",
		"starterCard": {
			"templateId": "hazard",
			"name": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Spear Launcher"
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
							"text": "Spear Launcher",
							"fontSize": 1.2
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
							"text": "Mechanical, Trap"
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
							"text": "Hazard 2"
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
							"text": "Complexity ",
							"bold": true
						},
						{
							"text": "Simple"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Stealth ",
							"bold": true
						},
						{
							"text": "DC 20 (trained)"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Description ",
							"bold": true
						},
						{
							"text": "A wall socket loaded with a spear connects to a floor tile in one 5-foot square."
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Disable ",
							"bold": true
						},
						{
							"text": "DC 18 Thievery (trained) on the floor tile or wall socket"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "AC ",
							"bold": true
						},
						{
							"text": "18, "
						},
						{
							"text": "Fort ",
							"bold": true
						},
						{
							"text": "+11, "
						},
						{
							"text": "Ref ",
							"bold": true
						},
						{
							"text": "+3"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Hardness ",
							"bold": true
						},
						{
							"text": "8, "
						},
						{
							"text": "HP ",
							"bold": true
						},
						{
							"text": "32 (BT 16); "
						},
						{
							"text": "Immunities ",
							"bold": true
						},
						{
							"text": "critical hits, object immunities, precision damage"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Spear ",
							"bold": true
						},
						{
							"text": "R",
							"fontFamily": "PF2EActionIcons"
						},
						{
							"text": " Trigger Pressure is applied to the floor tile; Effect The trap shoots a spear, making a Strike against the creature or object on the floor tile."
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
							"text": "Ranged",
							"bold": true
						},
						{
							"text": " spear +14, Damage 2d6+6 piercing"
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
							"text": "Stealth ",
							"bold": true
						},
						{
							"text": "+16 or DC 31"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Description ",
							"bold": true
						},
						{
							"text": "Hidden control panel at the end of the hallway"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Disable ",
							"bold": true
						},
						{
							"text": "DC 21 Thievery on the control panel"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "AC ",
							"bold": true
						},
						{
							"text": "27"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Fort / Ref ",
							"bold": true
						},
						{
							"text": "+13 / +17"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Hardness ",
							"bold": true
						},
						{
							"text": "14"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "HP / BT ",
							"bold": true
						},
						{
							"text": "56 / 28"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Reset ",
							"bold": true
						},
						{
							"text": "1 minute"
						}
					]
				}
			],
			"details": "",
			"image": "",
			"frontArtworkLayout": "hidden",
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

export default hazardTemplate
