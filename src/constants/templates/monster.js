import {
  createTemplateCard,
  createTemplateDefinition,
  inlineValue,
  labeledParagraph,
  templateDescriptionParagraphs,
} from './helpers'

const monsterTemplate = {
	"kind": "pf2e-card-template",
	"version": 1,
	"template": {
		"id": "monster",
		"label": "Monster",
		"description": "Custom template based on Goblin Warrior.",
		"starterCard": {
			"templateId": "monster",
			"name": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Goblin Warrior"
						}
					]
				}
			],
			"backTitle": [
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Goblin Warrior",
							"fontSize": 1.5
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
							"text": "Small, Goblin, Humanoid"
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
							"text": "Creature -1"
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
							"text": "Recall Knowledge",
							"bold": true
						},
						{
							"text": " DC 13 - Humanoid (Society)"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Perception ",
							"bold": true
						},
						{
							"text": "+2; darkvision"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Languages ",
							"bold": true
						},
						{
							"text": "Common, Goblin"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Skills ",
							"bold": true
						},
						{
							"text": "Acrobatics +5, Athletics +2, Nature +1, Stealth +5"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Str ",
							"bold": true
						},
						{
							"text": "+0, "
						},
						{
							"text": "Dex",
							"bold": true
						},
						{
							"text": " +3, "
						},
						{
							"text": "Con ",
							"bold": true
						},
						{
							"text": "+1, "
						},
						{
							"text": "Int ",
							"bold": true
						},
						{
							"text": "+0, "
						},
						{
							"text": "Wis ",
							"bold": true
						},
						{
							"text": "-1, "
						},
						{
							"text": "Cha ",
							"bold": true
						},
						{
							"text": "+1"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Items ",
							"bold": true
						},
						{
							"text": "dogslicer, leather armor, shortbow (10 arrows)"
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
							"text": "AC ",
							"bold": true
						},
						{
							"text": "16; "
						},
						{
							"text": "Fort ",
							"bold": true
						},
						{
							"text": "+5, "
						},
						{
							"text": "Ref ",
							"bold": true
						},
						{
							"text": "+7, "
						},
						{
							"text": "Will ",
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
							"text": "HP ",
							"bold": true
						},
						{
							"text": "6"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Goblin Scuttle",
							"bold": true
						},
						{
							"text": " "
						},
						{
							"text": "R",
							"fontFamily": "PF2EActionIcons"
						},
						{
							"text": " Trigger A goblin ally ends a move action adjacent to the warrior; "
						},
						{
							"text": "Effect ",
							"bold": true
						},
						{
							"text": "The goblin warrior Steps."
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
							"text": "Speed ",
							"bold": true
						},
						{
							"text": "25 feet"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Melee ",
							"bold": true
						},
						{
							"text": "A ",
							"fontFamily": "PF2EActionIcons"
						},
						{
							"text": "dogslicer +7 [+3/-1] (agile, backstabber, finesse), Damage 1d6 slashing"
						}
					]
				},
				{
					"type": "paragraph",
					"align": "left",
					"children": [
						{
							"text": "Ranged ",
							"bold": true
						},
						{
							"text": "A",
							"fontFamily": "PF2EActionIcons"
						},
						{
							"text": " shortbow +7 [+2/-3] (deadly d10, range increment 60 feet, reload 0), Damage 1d6 piercing"
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
			"frontBackgroundImage": "",
			"borderThickness": 1,
			"borderColor": "#333333",
			"descriptionBoxColor": "#ffffff",
			"descriptionBoxOpacity": 0.82,
			"frontBackgroundMode": "solid",
			"frontBackgroundGradientType": "linear",
			"frontBackgroundColor": "#feffff",
			"frontBackgroundSecondaryColor": "#dce4f0",
			"backBackgroundMode": "gradient",
			"backBackgroundGradientType": "linear",
			"backBackgroundColor": "#f20202",
			"backBackgroundSecondaryColor": "#f77e7e"
		}
	}
}

export default monsterTemplate
