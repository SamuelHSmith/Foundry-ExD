export default class TemplateImporter extends Application {
  constructor(app, options, object, data) {
    super(app)
    this.type = 'charm';
    this.errorText = '';
    this.showError = false;
    this.textBox = '';
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "ExD-template-importer";
    options.template = "systems/exalteddemake/templates/dialogues/template-importer.html"
    options.resizable = true;
    options.height = 900;
    options.width = 860;
    options.minimizable = true;
    options.title = "Template Importer"
    return options;
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    const helpButton = {
      label: game.i18n.localize('ExD.Help'),
      class: 'help-dialogue',
      icon: 'fas fa-question',
      onclick: async () => {
        let confirmed = false;
        const template = "systems/exalteddemake/templates/dialogues/help-dialogue.html"
        const html = await renderTemplate(template);
        new Dialog({
          title: `ReadMe`,
          content: html,
          buttons: {
            cancel: { label: "Close", callback: () => confirmed = false }
          }
        }).render(true);
      },
    };
    buttons = [helpButton, ...buttons];
    return buttons;
  }

  getData() {
    let data = super.getData();
    data.type = this.type;
    data.textBox = this.textBox;
    data.showError = this.showError;
    data.error = this.error;
    if (this.type === 'charm') {
      data.templateHint = game.i18n.localize("ExD.CharmImportHint");
    }
    if (this.type === 'spell') {
      data.templateHint = game.i18n.localize("ExD.SpellImportHint");
    }
    if (this.type === 'adversary') {
      data.templateHint = game.i18n.localize("ExD.AdversaryImportHint");
    }
    if (this.type === 'qc') {
      data.templateHint = game.i18n.localize("ExD.QCImportHint");
    }
    return data;
  }

  async createCharm(html) {
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    var index = 0;
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      var charmData = {
        type: 'charm',
        system: {
          cost: {
            "motes": 0,
            "initiative": 0,
            "anima": 0,
            "willpower": 0,
            "aura": "",
            "health": 0,
            "healthtype": "bashing",
            "silverxp": 0,
            "goldxp": 0,
            "whitexp": 0
          }
        }
      };
      charmData.name = textArray[index];
      index++;
      var costAndRequirement = textArray[index].replace('Cost: ', '').replace('Mins: ', '').split(';');
      index++;
      var costArray = costAndRequirement[0].split(',');
      for (let costString of costArray) {
        costString = costString.trim();
        if (costString.includes('m')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.motes = parseInt(num);
        }
        if (costString.includes('i')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.initiative = parseInt(num);
        }
        if (costString.includes('a')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.anima = parseInt(num);
        }
        if (costString.includes('wp')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.willpower = parseInt(num);
        }
        if (costString.includes('hl')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.health = parseInt(num);
          if (costString.includes('ahl')) {
            charmData.system.cost.healthtype = 'aggravated';
          }
          if (costString.includes('lhl')) {
            charmData.system.cost.healthtype = 'lethal';
          }
        }
        if (costString.includes('Fire')) {
          charmData.system.cost.aura = 'fire';
        }
        if (costString.includes('Earth')) {
          charmData.system.cost.aura = 'earth';
        }
        if (costString.includes('Air')) {
          charmData.system.cost.aura = 'air';
        }
        if (costString.includes('Water')) {
          charmData.system.cost.aura = 'water';
        }
        if (costString.includes('Wood')) {
          charmData.system.cost.aura = 'wood';
        }
        if (costString.includes('gxp')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.goldxp = parseInt(num);
        }
        else if (costString.includes('sxp')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.silverxp = parseInt(num);
        }
        else if (costString.includes('wxp')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.whitexp = parseInt(num);
        }
        else if (costString.includes('xp')) {
          var num = costString.replace(/[^0-9]/g, '');
          charmData.system.cost.xp = parseInt(num);
        }
      }
      var requirementArray = costAndRequirement[1].toLowerCase().split(',');
      var abilityRequirement = requirementArray[0].trim().split(' ');

      charmData.system.ability = abilityRequirement[0].replace(' ', '');
      charmData.system.requirement = abilityRequirement[1].replace(/[^0-9]/g, '');

      if(requirementArray.length > 1) {
        var essenceRequirement = requirementArray[1].trim().split(' ');
        charmData.system.essence = essenceRequirement[1].replace(/[^0-9]/g, '');
      }

      charmData.system.type = textArray[index].replace('Type: ', '');
      index++;
      charmData.system.keywords = textArray[index].replace('Keywords: ', '');
      index++;
      charmData.system.duration = textArray[index].replace('Duration: ', '');
      index++;
      charmData.system.prerequisites = textArray[index].replace('Prerequisite Charms: ', '');
      index++;
      var description = '';
      while(textArray[index] && index !== textArray.length) {
        description += textArray[index];
        description += " ";
        index++;
      }
      charmData.system.description = description;
      await Item.create(charmData);
      index++;
    }
  }

  async createSpell(html) {
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    var index = 0;
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      var spellData = {
        type: 'spell',
        system: {
        }
      };
      spellData.name = textArray[index];
      index++;
      var costArray = textArray[index].replace('Cost: ', '').split(',');
      index++;
      for (let costString of costArray) {
        costString = costString.trim();
        if (costString.includes('sm')) {
          var num = costString.replace(/[^0-9]/g, '');
          spellData.system.cost = parseInt(num);
        }
        if (costString.includes('wp')) {
          var num = costString.replace(/[^0-9]/g, '');
          spellData.system.willpower = parseInt(num);
        }
      }
  
      spellData.system.keywords = textArray[index].replace('Keywords: ', '');
      index++;
      spellData.system.duration = textArray[index].replace('Duration: ', '');
      index++;
      var description = '';
      while(textArray[index] && index !== textArray.length) {
        description += textArray[index];
        description += " ";
        index++;
      }
      spellData.system.description = description;
      await Item.create(spellData);
      index++;
    }
  }

  _getStatBlock(adversary = false) {
    if (adversary) {
      return {
        type: 'character',
        system: {
          "attributes": {
            "strength": {
              "favored": false,
              "value": 1,
              "name": "ExD.Strength"
            },
            "charisma": {
              "favored": false,
              "value": 1,
              "name": "ExD.Charisma"
            },
            "perception": {
              "favored": false,
              "value": 1,
              "name": "ExD.Perception"
            },
            "dexterity": {
              "favored": false,
              "value": 1,
              "name": "ExD.Dexterity"
            },
            "manipulation": {
              "favored": false,
              "value": 1,
              "name": "ExD.Manipulation"
            },
            "intelligence": {
              "favored": false,
              "value": 1,
              "name": "ExD.Intelligence"
            },
            "stamina": {
              "favored": false,
              "value": 1,
              "name": "ExD.Stamina"
            },
            "appearance": {
              "favored": false,
              "value": 1,
              "name": "ExD.Appearance"
            },
            "wits": {
              "favored": false,
              "value": 1,
              "name": "ExD.Wits"
            }
          },
          "abilities": {
            "archery": {
              "favored": false,
              "value": 0,
              "name": "ExD.Archery"
            },
            "athletics": {
              "favored": false,
              "value": 0,
              "name": "ExD.Athletics"
            },
            "awareness": {
              "favored": false,
              "value": 0,
              "name": "ExD.Awareness"
            },
            "brawl": {
              "favored": false,
              "value": 0,
              "name": "ExD.Brawl"
            },
            "bureaucracy": {
              "favored": false,
              "value": 0,
              "name": "ExD.Bureaucracy"
            },
            "craft": {
              "favored": false,
              "value": 0,
              "name": "ExD.Craft"
            },
            "Empathy": {
              "favored": false,
              "value": 0,
              "name": "ExD.Empathy"
            },
            "investigation": {
              "favored": false,
              "value": 0,
              "name": "ExD.Investigation"
            },
            "larceny": {
              "favored": false,
              "value": 0,
              "name": "ExD.Larceny"
            },
            "linguistics": {
              "favored": false,
              "value": 0,
              "name": "ExD.Linguistics"
            },
            "lore": {
              "favored": false,
              "value": 0,
              "name": "ExD.Lore"
            },
            "martialarts": {
              "favored": false,
              "value": 0,
              "name": "ExD.MartialArts"
            },
            "medicine": {
              "favored": false,
              "value": 0,
              "name": "ExD.Medicine"
            },
            "melee": {
              "favored": false,
              "value": 0,
              "name": "ExD.Melee"
            },
            "occult": {
              "favored": false,
              "value": 0,
              "name": "ExD.Occult"
            },
            "performance": {
              "favored": false,
              "value": 0,
              "name": "ExD.Performance"
            },
            "presence": {
              "favored": false,
              "value": 0,
              "name": "ExD.Presence"
            },
            "resistance": {
              "favored": false,
              "value": 0,
              "name": "ExD.Resistance"
            },
            "ride": {
              "favored": false,
              "value": 0,
              "name": "ExD.Ride"
            },
            "sail": {
              "favored": false,
              "value": 0,
              "name": "ExD.Sail"
            },
            "socialize": {
              "favored": false,
              "value": 0,
              "name": "ExD.Socialize"
            },
            "stealth": {
              "favored": false,
              "value": 0,
              "name": "ExD.Stealth"
            },
            "survival": {
              "favored": false,
              "value": 0,
              "name": "ExD.Survival"
            },
            "thrown": {
              "favored": false,
              "value": 0,
              "name": "ExD.Thrown"
            },
            "war": {
              "favored": false,
              "value": 0,
              "name": "ExD.War"
            }
          },
          "health": {
            "levels": {
              "zero": {
                "value": 1,
                "penalty": 0
              },
              "one": {
                "value": 2,
                "penalty": 1
              },
              "two": {
                "value": 2,
                "penalty": 2
              },
              "four": {
                "value": 1,
                "penalty": 5
              },
              "inc": {
                "value": 1,
                "penalty": "inc"
              }
            },
            "bashing": 0,
            "lethal": 0,
            "aggravated": 0,
            "value": 0,
            "max": 0
          },
          "willpower": {
            "value": 0,
            "total": 5,
            "max": 5,
            "min": 0
          },
          "speed": {
            "value": 0,
            "min": 0
          },
          "essence": {
            "value": 1,
            "min": 0,
            "max": 10
          },
          "motes": {
            "personal": {
              "value": 0,
              "total": 0,
              "max": 0,
              "committed": 0
            },
            "peripheral": {
              "value": 0,
              "total": 0,
              "max": 0,
              "committed": 0
            }
          },
          "dodge": {
            "value": 0
          },
          "parry": {
            "value": 0
          },
          "soak": {
            "value": 1
          },
          "armoredsoak": {
            "value": 0
          },
          "naturalsoak": {
            "value": 1
          },
          "hardness": {
            "value": 0,
            "min": 0
          },
          "resolve": {
            "value": 0
          },
          "guile": {
            "value": 0
          },
          "appearance": {
            "value": 0
          },
          "anima": {
            "value": 0,
            "max": 3,
            "level": "Dim",
            "passive": "",
            "active": "",
            "iconic": ""
          },
          "sorcery": {
            "motes": 0
          },
          "savedRolls": {},
          "legendarysize": false,
          "traits": {
            "languages": {
              "value": [],
              "custom": ""
            }
          },
          "details": {
            "exalt": "abyssal",
            "caste": "",
            "color": "#000000",
            "tell": "",
            "aura": "none",
            "ideal": "",
            "supernal": "",
            "penumbra": {
              "value": 0,
              "max": 10,
              "min": 0
            }
          },
          "creaturetype": "mortal",
          "qualities": '',
          "escort": '',
          "settings": {
            "charmmotepool": "peripheral",
            "showwarstrider": false,
            "showship": false,
            "showescort": false,
            "showzerovalues": false,
            "usetenattributes": false,
          },
        }
      };
    };
    return {
      type: 'npc',
      system: {
        "pools": {
          "administration": {
            "name": "ExD.Administration",
            "value": 0
          },
          "command": {
            "name": "ExD.Command",
            "value": 0
          },
          "craft": {
            "name": "ExD.Craft",
            "value": 0
          },
          "strength": {
            "name": "ExD.FeatsofStrength",
            "value": 0
          },
          "grapple": {
            "name": "ExD.GrappleControl",
            "value": 0
          },
          "investigation": {
            "name": "ExD.Investigation",
            "value": 0
          },
          "joinbattle": {
            "name": "ExD.JoinBattle",
            "value": 0
          },
          "larceny": {
            "name": "ExD.Larceny",
            "value": 0
          },
          "medicine": {
            "name": "ExD.Medicine",
            "value": 0
          },
          "movement": {
            "name": "ExD.Movement",
            "value": 0
          },
          "readintentions": {
            "name": "ExD.ReadIntentions",
            "value": 0
          },
          "resistpoison": {
            "name": "ExD.ResistPoison",
            "value": 0
          },
          "sail": {
            "name": "ExD.Sail",
            "value": 0
          },
          "senses": {
            "name": "ExD.Senses",
            "value": 0
          },
          "social": {
            "name": "ExD.Social",
            "value": 0
          },
          "sorcery": {
            "name": "ExD.Sorcery",
            "value": 0
          },
          "strategy": {
            "name": "ExD.Strategy",
            "value": 0
          },
          "stealth": {
            "name": "ExD.Stealth",
            "value": 0
          },
          "tracking": {
            "name": "ExD.Tracking",
            "value": 0
          },
          "other": {
            "name": "ExD.Other",
            "value": 0
          }
        },
        "health": {
          "levels": {
            "zero": {
              "value": 1,
              "penalty": 0
            },
            "one": {
              "value": 2,
              "penalty": 1
            },
            "two": {
              "value": 2,
              "penalty": 2
            },
            "four": {
              "value": 1,
              "penalty": 5
            },
            "inc": {
              "value": 1,
              "penalty": "inc"
            }
          },
          "bashing": 0,
          "lethal": 0,
          "aggravated": 0,
          "value": 0,
          "max": 0
        },
        "willpower": {
          "value": 0,
          "total": 5,
          "max": 5,
          "min": 0
        },
        "speed": {
          "value": 0,
          "min": 0
        },
        "essence": {
          "value": 1,
          "min": 0,
          "max": 10
        },
        "motes": {
          "personal": {
            "value": 0,
            "total": 0,
            "max": 0,
            "committed": 0
          },
          "peripheral": {
            "value": 0,
            "total": 0,
            "max": 0,
            "committed": 0
          }
        },
        "dodge": {
          "value": 0
        },
        "parry": {
          "value": 0
        },
        "soak": {
          "value": 1
        },
        "armoredsoak": {
          "value": 0
        },
        "naturalsoak": {
          "value": 1
        },
        "hardness": {
          "value": 0,
          "min": 0
        },
        "resolve": {
          "value": 0
        },
        "guile": {
          "value": 0
        },
        "appearance": {
          "value": 0
        },
        "anima": {
          "value": 0,
          "max": 3,
          "level": "Dim",
          "passive": "",
          "active": "",
          "iconic": ""
        },
        "sorcery": {
          "motes": 0
        },
        "savedRolls": {},
        "legendarysize": false,
        "traits": {
          "languages": {
            "value": [],
            "custom": ""
          }
        },
        "details": {
          "exalt": "abyssal",
          "caste": "",
          "color": "#000000",
          "tell": "",
          "aura": "none",
          "ideal": "",
          "supernal": "",
          "penumbra": {
            "value": 0,
            "max": 10,
            "min": 0
          }
        },
        "creaturetype": "mortal",
        "qualities": '',
        "escort": '',
        "settings": {
          "charmmotepool": "peripheral",
          "showwarstrider": false,
          "showship": false,
          "showescort": false,
          "showzerovalues": false,
          "usetenattributes": false,
        },
      }
    };
  }

  async createQuickCharacter(html) {
    var actorData = this._getStatBlock(false);
    const itemData = [
    ];
    let index = 1;
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    try {
      actorData.name = textArray[0].trim();
      var actorDescription = '';
      while (!textArray[index].includes('Caste:') && !textArray[index].includes('Aspect:') && !textArray[index].includes('Essence:')) {
        actorDescription += textArray[index];
        index++;
      }
      actorData.system.biography = actorDescription;
      if (textArray[index].includes('Caste') || textArray[index].includes('Aspect')) {
        this._getExaltSpecificData(textArray, index, actorData, false);
        index++;
      }
      if (textArray[index].includes('Spirit Shape')) {
        var lunarArray = textArray[index].split(';');
        actorData.system.qualities += `${lunarArray[0].trim()} \n`;
        var tellArray = lunarArray[1].split(':')
        actorData.system.details.exalt = 'lunar';
        actorData.system.details.tell = tellArray[1].trim();
        index++;
      }
      var statArray = textArray[index].replace(/ *\([^)]*\) */g, "").replace('Cost: ', '').split(';');
      actorData.system.essence.value = parseInt(statArray[0].replace(/[^0-9]/g, ''));
      actorData.system.willpower.value = parseInt(statArray[1].replace(/[^0-9]/g, ''));
      actorData.system.willpower.max = parseInt(statArray[1].replace(/[^0-9]/g, ''));
      actorData.system.pools.joinbattle.value = parseInt(statArray[2].replace(/[^0-9]/g, ''));
      index++;
      if (textArray[index].includes('Health Levels')) {
        this._getHealthLevels(textArray, index, actorData);
        index++;
      }
      else {
        var motesArray = textArray[index].replace(/ *\([^)]*\) */g, "").split(';');
        if (motesArray.length === 1) {
          actorData.system.motes.personal.value = parseInt(motesArray[0].replace(/[^0-9]/g, ''));
          actorData.system.motes.personal.max = parseInt(motesArray[0].replace(/[^0-9]/g, ''));
        }
        else {
          actorData.system.motes.personal.value = parseInt(motesArray[0].replace(/[^0-9]/g, ''));
          actorData.system.motes.personal.max = parseInt(motesArray[0].replace(/[^0-9]/g, ''));
          actorData.system.motes.peripheral.value = parseInt(motesArray[1].replace(/[^0-9]/g, ''));
          actorData.system.motes.peripheral.max = parseInt(motesArray[1].replace(/[^0-9]/g, ''));
        }
        index++;
        this._getHealthLevels(textArray, index, actorData);
        index++;
      }
      var intimacyString = '';
      var intimacyArray = [];
      if (textArray[index].includes('Intimacies')) {
        var intimacyStrength = 'defining';
        while (!textArray[index].includes('Actions:') && !textArray[index].includes('Speed Bonus:') && !(/Actions \([^)]*\)/g).test(textArray[index]) && !textArray[index].includes('Guile:')) {
          intimacyString += textArray[index];
          index++;
        }
        var intimaciesArray = intimacyString.replace('Intimacies:', '').replace('/', '').split(';');
        for (const intimacy of intimaciesArray) {
          if (intimacy) {
            intimacyArray = intimacy.split(':');
            var intimacyType = 'tie';
            if (intimacyArray[0].includes('Principle')) {
              intimacyType = 'principle';
            }
            else if (intimacyArray[0].includes('Tie')) {
              intimacyType = 'tie';
            }
            if(intimacyArray.length > 1) {
              intimacyStrength = intimacyArray[0].replace('Principle', '').replace('Tie', '').replace('“', '').replace('”', '').trim().toLowerCase();
              itemData.push(
                {
                  type: 'intimacy',
                  img: this.getImageUrl('intimacy'),
                  name: intimacyArray[1].trim(),
                  system: {
                    description: intimacyArray[1].trim(),
                    intimacytype: intimacyType,
                    strength: intimacyArray[0].replace('Principle', '').replace('Tie', '').replace('“', '').replace('”', '').trim().toLowerCase()
                  }
                }
              );
            }
            else {
              itemData.push(
                {
                  type: 'intimacy',
                  img: this.getImageUrl('intimacy'),
                  name: intimacyArray[0].trim(),
                  system: {
                    description: intimacyArray[0].trim(),
                    intimacytype: intimacyType,
                    strength: intimacyStrength
                  }
                }
              );
            }
          }
        }
      }
      if (textArray[index].includes('Speed Bonus')) {
        actorData.system.speed.value = parseInt(textArray[index].replace(/[^0-9]/g, ''));
        index++;
      }
      var actionsString = '';
      while (!textArray[index].includes('Guile') && textArray[index].toLowerCase() !== 'combat') {
        actionsString += textArray[index];
        index++;
      }
      var actionsArray = actionsString.replace('Actions:', '').replace('/', '').replace(/ *\([^)]*\) */g, "").split(';');
      for (const action of actionsArray) {
        if (!/^\s*$/.test(action)) {
          var actionSplit = action.trim().replace('dice', '').replace('.', '').split(':');
          var name = actionSplit[0].replace(" ", "");
          if (name.toLocaleLowerCase().includes('resistpoison') || name.toLocaleLowerCase().includes('resistdiseasepoison')) {
            actorData.system.pools.resistpoison.value = parseInt(actionSplit[1].trim());
          }
          else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'socialinfluence') {
            actorData.system.pools.social.value = parseInt(actionSplit[1].trim());
          }
          else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'featsofstrength') {
            actorData.system.pools.strength.value = parseInt(actionSplit[1].trim());
          }
          else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'shapesorcery') {
            actorData.system.pools.sorcery.value = parseInt(actionSplit[1].trim());
          }
          else if (name.replace(/\s+/g, '').toLocaleLowerCase() === 'readmotives') {
            actorData.system.pools.readintentions.value = parseInt(actionSplit[1].trim());
          }
          else if (actorData.system.pools[name.toLocaleLowerCase()]) {
            actorData.system.pools[name.toLocaleLowerCase()].value = parseInt(actionSplit[1].trim());
          }
          else {
            itemData.push(
              {
                type: 'action',
                img: this.getImageUrl('action'),
                name: name,
                system: {
                  value: parseInt(actionSplit[1].trim())
                }
              }
            )
          }
        }
      }
      if (textArray[index].toLowerCase().includes('resolve')) {
        var socialArray = textArray[index].replace(/ *\([^)]*\) */g, "").split(',');
        if (textArray[index].toLowerCase().includes('appearance')) {
          actorData.system.appearance.value = parseInt(socialArray[0].trim().split(" ")[1]);
          actorData.system.resolve.value = parseInt(socialArray[1].trim().split(" ")[1]);
          actorData.system.guile.value = parseInt(socialArray[2].trim().split(" ")[1]);
        }
        else {
          actorData.system.resolve.value = parseInt(socialArray[0].trim().split(" ")[1]);
          actorData.system.guile.value = parseInt(socialArray[1].trim().split(" ")[1]);
        }
        index++
      }

      if (textArray[index].trim().toLowerCase() === 'combat') {
        index++;
      }
      while (textArray[index].includes('Attack')) {
        var attackString = textArray[index];
        if (!textArray[index + 1].includes('Attack') && !textArray[index + 1].includes('Combat Movement')) {
          attackString += textArray[index + 1];
          index++;
        }
        var attackArray = attackString.replace('Attack ', '').split(':');
        var attackName = attackArray[0].replace('(', '').replace(')', '');
        var damage = 1;
        var overwhelming = 1;
        var accuracy = 0;
        var weaponDescription = ''
        var accuracySplit = attackArray[1].trim().replace(')', '').split('(');
        accuracy = parseInt(accuracySplit[0].replace(/[^0-9]/g, ''));
        if (!attackString.toLowerCase().includes('grapple')) {
          var damageSplit = accuracySplit[1].split('Damage');
          if (damageSplit[1].includes('/')) {
            var damageSubSplit = damageSplit[1].split('/');
            damage = parseInt(damageSubSplit[0].replace(/[^0-9]/g, ''));
            overwhelming = parseInt(damageSubSplit[1].replace(/[^0-9]/g, ''));
          }
          else if (damageSplit[1].includes(',')) {
            var damageSubSplit = damageSplit[1].split(',');
            damage = parseInt(damageSubSplit[0].replace(/[^0-9]/g, ''));
            if (damageSplit[1].includes('minimum')) {
              overwhelming = parseInt(damageSubSplit[1].replace(/[^0-9]/g, ''));
            }
          }
          else if (damageSplit[1].includes(';')) {
            damage = parseInt(damageSplit[1].split(';')[0].replace(/[^0-9]/g, ''))
            weaponDescription = damageSplit[1].split(';')[1];
          }
          else {
            damage = parseInt(damageSplit[1].replace(/[^0-9]/g, ''));
          }
        }
        // else {
        //   // Doesn't work
        //   var grappleValue = parseInt(damageSplit[1].replace(/[^0-9]/g, ''));
        //   actorData.system.pools.grapple.value = grappleValue;
        // }
        index++;
        itemData.push(
          {
            type: 'weapon',
            img: this.getImageUrl('weapon'),
            name: attackName.trim(),
            system: {
              description: weaponDescription,
              witheringaccuracy: accuracy,
              witheringdamage: damage,
              overwhelming: overwhelming,
            }
          }
        );
      }
      if (textArray[index].includes('Combat Movement:')) {
        var combatMovementArray = textArray[index].split(':');
        actorData.system.pools.movement.value = parseInt(combatMovementArray[1].replace(/ *\([^)]*\) */g, "").replace(/[^0-9]/g, ''));
        index++;
      }


      var defenseLine = textArray[index].replace(/ *\([^)]*\) */g, "");
      if (defenseLine.includes(',')) {
        var defenseArray = defenseLine.split(',');
        actorData.system.dodge.value = parseInt(defenseArray[0].replace(/[^0-9]/g, ''));
        actorData.system.parry.value = parseInt(defenseArray[1].replace(/[^0-9]/g, ''));
      }
      else if (defenseLine.includes(';')) {
        var defenseArray = defenseLine.split(';');
        actorData.system.dodge.value = parseInt(defenseArray[0].replace(/[^0-9]/g, ''));
        actorData.system.parry.value = parseInt(defenseArray[1].replace(/[^0-9]/g, ''));
      }
      index++;

      var soakArray = textArray[index].replace('Soak/Hardness:', '').replace(/ *\([^)]*\) */g, "").split('/');

      actorData.system.soak.value = parseInt(soakArray[0].replace(/[^0-9]/g, ''));

      if (soakArray[1].includes('(')) {
        var hardnessArray = soakArray[1].replace(')', '').split('(');
        actorData.system.hardness.value = parseInt(hardnessArray[0].replace(/[^0-9]/g, ''));
        itemData.push(
          {
            type: 'armor',
            img: this.getImageUrl('armor'),
            name: hardnessArray[1].trim(),
          }
        );
      }
      else {
        actorData.system.hardness.value = parseInt(soakArray[1].replace(/[^0-9]/g, ''));
      }
      index++;
      itemData.push(...this._getItemData(textArray, index, actorData));
      actorData.items = itemData;
      await Actor.create(actorData);
    }
    catch (error) {
      console.log(error);
      console.log(textArray);
      console.log(index);
      this.error = textArray[index];
      this.showError = true;
    }
  }

  _getHealthLevels(textArray, index, actorData) {
    var healthArray = textArray[index].replace('Health Levels: ', '').replace('/incap.', '').split('/');
    for (const health of healthArray) {
      if (health.includes('0x')) {
        actorData.system.health.levels.zero.value = parseInt(health.replace('0x', '').replace(/[^0-9]/g, ''));
      }
      if (health.includes('1x')) {
        actorData.system.health.levels.one.value = parseInt(health.replace('1x', '').replace(/[^0-9]/g, ''));
      }
      if (health.includes('2x')) {
        actorData.system.health.levels.two.value = parseInt(health.replace('2x', '').replace(/[^0-9]/g, ''));
      }
      if (health.includes('5x')) {
        actorData.system.health.levels.five.value = parseInt(health.replace('5x', '').replace(/[^0-9]/g, ''));
      }
    }
  }

  _getExaltSpecificData(textArray, index, actorData, isAdversary) {
    if (!isAdversary) {
      actorData.system.creaturetype = 'exalt';
    }
    actorData.system.details.caste = textArray[index].replace('Caste: ', '').replace('Aspect: ', '').trim();
    if (['earth', 'water', 'air', 'fire', 'wood'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'dragonblooded';
    }
    if (['no mood', 'full moon', 'changing moon', 'casteless'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'lunar';
    }
    if (['dawn', 'zenith', 'twilight', 'night', 'eclipse'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'solar';
    }
    if (['serenity', 'battles', 'endings', 'journeys', 'secrets'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'sidereal';
    }
    if (['dusk', 'midnight', 'daybreak', 'moonshadow', 'day'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'abyssal';
    }
    if (['adamant', 'jade', 'moonsilver', 'orichalcum', 'starmetal', 'soulsteel'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'alchemical';
    }
    if (['spring', 'summer', 'fall', 'winter'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'getimian';
    }
    if (['azimuth', 'ascendant', 'horizon', 'nadir', 'penumbra'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'infernal';
    }
    if (['blood', 'breath', 'flesh', 'marrow', 'soil'].includes(actorData.system.details.caste.toLocaleLowerCase())) {
      actorData.system.details.exalt = 'liminal';
    }
  }

  _getItemData(textArray, index, actorData) {
    var itemData = [];
    if (textArray[index] === '') {
      index++;
    }
    var itemType = 'charm';
    var newItem = true;
    var itemName = '';
    var itemDescription = '';
    var charmSystemData = {
      description: '',
      ability: 'other',
      cost: {
        "motes": 0,
        "initiative": 0,
        "anima": 0,
        "willpower": 0,
        "aura": "",
        "health": 0,
        "healthtype": "bashing",
        "silverxp": 0,
        "goldxp": 0,
        "whitexp": 0
      }

    };
    var spellSystemData = {
      description: '',
    };
    while (index < textArray.length && textArray[index].trim().toLowerCase() !== 'end') {
      if (textArray[index] && index !== (textArray.length - 1)) {
        if (newItem) {
          if (textArray[index].trim().toLowerCase() === 'merits') {
            itemType = 'merit';
            index++;
            newItem = true;
          }
          if (textArray[index].trim().toLowerCase() === 'intimacies') {
            itemType = 'intimacy';
            index++;
            newItem = true;
          }
          if (textArray[index].trim().toLowerCase().includes('charms') || textArray[index].trim().toLowerCase() === 'war' || textArray[index].trim().toLowerCase() === 'evocations') {
            if (textArray[index].trim().toLowerCase().includes('offensive charms')) {
              charmSystemData.ability = 'offensive';
            }
            else if (textArray[index].trim().toLowerCase() === 'defensive charms') {
              charmSystemData.ability = 'defensive';
            }
            else if (textArray[index].trim().toLowerCase() === 'social charms') {
              charmSystemData.ability = 'social';
            }
            else if (textArray[index].trim().toLowerCase() === 'mobility charms') {
              charmSystemData.ability = 'mobility';
            }
            else if (textArray[index].trim().toLowerCase() === 'evocations') {
              charmSystemData.ability = 'evocation';
            }
            else if (textArray[index].trim().toLowerCase() === 'war' || textArray[index].trim().toLowerCase() === 'warfare charms' || textArray[index].trim().toLowerCase() === 'war charms') {
              charmSystemData.ability = 'war';
            }
            else {
              charmSystemData.ability = 'other';
            }
            itemType = 'charm';
            index++;
            newItem = true;
          }
          if (textArray[index].trim().toLowerCase() === 'sorcery') {
            itemType = 'spell';
            index++;
            newItem = true;
            charmSystemData.ability = 'occult';
          }
          if (textArray[index].trim().toLowerCase() === 'shapeshifting') {
            itemType = 'quality';
            index++;
            newItem = true;
            itemDescription += textArray[index].trim();
            itemDescription += '\n';
          }
          if (textArray[index].trim().toLowerCase() === 'escort') {
            itemType = 'escort';
            index++;
            newItem = true;
            actorData.system.settings.showescort = true;
          }
          if (textArray[index].trim().toLowerCase() === 'special abilities' || textArray[index].trim().toLowerCase() === 'special attacks' || textArray[index].trim().toLowerCase() === 'traits') {
            itemType = 'specialability';
            index++;
            newItem = true;
          }
        }
        if (index > textArray.length - 1) {
          break;
        }
        if (textArray[index].trim() === '') {
          index++;
        }
        if (index > textArray.length - 1) {
          break;
        }
        if (newItem) {
          if (itemType === 'intimacy') {
            var intimacyArray = textArray[index].split(':');
            var intimacyType = 'tie';
            if (intimacyArray[0].includes('Principle')) {
              intimacyType = 'principle';
            }
            else if (intimacyArray[0].includes('Tie')) {
              intimacyType = 'tie';
            }
            itemData.push(
              {
                type: itemType,
                img: this.getImageUrl(itemType),
                name: intimacyArray[1].trim(),
                system: {
                  description: intimacyArray[1].trim(),
                  intimacytype: intimacyType,
                  strength: intimacyArray[0].replace('Principle', '').replace('Tie', '').trim().toLowerCase()
                }
              }
            );
          }
          //First line
          else if (itemType === 'specialability' || itemType === 'merit') {
            var titleArray = textArray[index].split(':');
            itemName = titleArray[0].trim();
            if (titleArray.length === 2) {
              itemDescription += titleArray[1].trim();
            }
            if (itemType === 'merit' && itemName === 'Legendary Size') {
              actorData.system.legendarysize = true;
            }
            newItem = false;
          }
          else if (itemType === 'quality' || itemType === 'escort') {
            itemDescription += textArray[index].trim();
            newItem = false;
          }
          else if (itemType === 'spell') {
            if (textArray[index].toLowerCase().includes('shaping ritual')) {
              var titleArray = textArray[index].split(':');
              itemName = titleArray[0].trim();
              if (titleArray.length === 2) {
                itemDescription += titleArray[1].trim();
              }
              itemType = 'initiation';
            }
            else if (!(/\d+(\.\d+)?sm/g).test(textArray[index]) && !textArray[index].includes('Ritual')) {
              itemType = 'charm';
            }
            else {
              itemType = 'spell';
              var titleArray = (textArray[index] + textArray[index + 1]).split('(');
              itemName = titleArray[0].trim();
              var contentArray = titleArray[1].split('):');
              var spellDataArray = contentArray[0].trim().split(';');
              itemDescription += contentArray[1].trim();
              var costArray = spellDataArray[0].replace(/\[(.+?)\]/g, '').trim().split(',');
              for (let costString of costArray) {
                costString = costString.trim();
                if (costString.includes('sm')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  spellSystemData.cost = parseInt(num);
                }
                if (costString.includes('wp')) {
                  var num = costString.replace(/[^0-9]/g, '');
                  spellSystemData.willpower = parseInt(num);
                }
              }
              index++;
              spellSystemData.duration = spellDataArray[1]?.trim() || '';
              spellSystemData.keywords = spellDataArray[2]?.trim() || '';
            }
            newItem = false;
          }
          if (itemType === 'charm') {
            var titleArray = (textArray[index] + textArray[index + 1]).split('(');
            itemName = titleArray[0].trim();
            var contentArray = titleArray[1].split('):');
            var charmDataArray = contentArray[0].trim().split(';');
            itemDescription += contentArray[1].trim();
            var costArray = charmDataArray[0].replace(/\[(.+?)\]/g, '').trim().split(',');
            for (var i = 0; i < costArray.length; i++) {
              var costString = costArray[i].trim();
              if (costString.includes('m')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.motes = parseInt(num);
              }
              if (costString.includes('i')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.initiative = parseInt(num);
              }
              if (costString.includes('a')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.anima = parseInt(num);
              }
              if (costString.includes('wp')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.willpower = parseInt(num);
              }
              if (costString.includes('hl')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.health = parseInt(num);
                if (costString.includes('ahl')) {
                  charmSystemData.cost.healthtype = 'aggravated';
                }
                if (costString.includes('lhl')) {
                  charmSystemData.cost.healthtype = 'lethal';
                }
              }
              if (costString.includes('Fire')) {
                charmSystemData.cost.aura = 'fire';
              }
              if (costString.includes('Earth')) {
                charmSystemData.cost.aura = 'earth';
              }
              if (costString.includes('Air')) {
                charmSystemData.cost.aura = 'air';
              }
              if (costString.includes('Water')) {
                charmSystemData.cost.aura = 'water';
              }
              if (costString.includes('Wood')) {
                charmSystemData.cost.aura = 'wood';
              }
              if (costString.includes('gxp')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.goldxp = parseInt(num);
              }
              else if (costString.includes('sxp')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.silverxp = parseInt(num);
              }
              else if (costString.includes('wxp')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.whitexp = parseInt(num);
              }
              else if (costString.includes('xp')) {
                var num = costString.replace(/[^0-9]/g, '');
                charmSystemData.cost.xp = parseInt(num);
              }
            }
            charmSystemData.type = charmDataArray[1]?.trim() || '';
            charmSystemData.duration = charmDataArray[2]?.trim() || '';
            if (charmSystemData.type === 'Permanent') {
              charmSystemData.duration = 'Permanent';
            }
            else {
              charmSystemData.duration = charmDataArray[2]?.trim() || '';
            }
            charmSystemData.keywords = charmDataArray[3]?.trim() || '';
            index++;
            newItem = false;
          }
        }
        else {
          itemDescription += ` ${textArray[index].trim()}`;
        }
      }
      else {
        if (index === textArray.length - 1) {
          itemDescription += ` ${textArray[index].trim()}`;
        }
        newItem = true;
        // Create Items
        if (itemType === 'specialability' || itemType === 'merit' || itemType === 'initiation') {
          itemData.push(
            {
              type: itemType,
              img: this.getImageUrl(itemType),
              name: itemName,
              system: {
                description: itemDescription.trim(),
              }
            }
          );
          if (itemType === 'initiation') {
            itemType = 'spell';
          }
        }
        else if (itemType === 'charm') {
          charmSystemData.description = itemDescription.trim();
          itemData.push(
            {
              type: itemType,
              img: this.getImageUrl(itemType),
              name: itemName,
              system: charmSystemData,
            }
          );
          if (charmSystemData.ability === 'occult') {
            itemType = 'spell';
          }
        }
        else if (itemType === 'spell') {
          spellSystemData.description = itemDescription.trim();
          itemData.push(
            {
              type: itemType,
              img: this.getImageUrl(itemType),
              name: itemName,
              system: spellSystemData,
            }
          );
        }
        else if (itemType === 'quality') {
          actorData.system.qualities += itemDescription.trim();
        }
        else if (itemType === 'escort') {
          actorData.system.escort += itemDescription.trim();
        }
        charmSystemData = {
          description: '',
          ability: charmSystemData.ability,
          cost: {
            "motes": 0,
            "initiative": 0,
            "anima": 0,
            "willpower": 0,
            "aura": "",
            "health": 0,
            "healthtype": "bashing",
            "silverxp": 0,
            "goldxp": 0,
            "whitexp": 0
          }
        };
        spellSystemData = {
          description: '',
        };
        itemName = '';
        itemDescription = '';
      }
      index++;
    }
    return itemData;
  }

  async createAdversary(html) {
    var actorData = this._getStatBlock(true);
    const itemData = [
    ];
    let index = 1;
    var textArray = html.find('#template-text').val().split(/\r?\n/);
    try {
      actorData.name = textArray[0].trim();
      var actorDescription = '';
      var addingIntimacies = false;
      var intimacyString = '';
      while (!textArray[index].includes('Caste:') && !textArray[index].includes('Aspect') && !textArray[index].includes('Attributes:')) {
        if (textArray[index].includes('Intimacies:')) {
          addingIntimacies = true;
        }
        if (textArray[index].includes('Secrets:')) {
          addingIntimacies = false;
          var intimacyArray = intimacyString.split(';');
          var intimacyStrength = 'minor';
          for (let intimacy of intimacyArray) {
            if (intimacy.includes('Defining:')) {
              intimacyStrength = 'defining';
              intimacy = intimacy.replace('Defining:', '');
            }
            if (intimacy.includes('Major:')) {
              intimacyStrength = 'major';
              intimacy = intimacy.replace('Major:', '');
            }
            if (intimacy.includes('Minor:')) {
              intimacyStrength = 'minor';
              intimacy = intimacy.replace('Minor:', '');
            }
            itemData.push(
              {
                type: 'intimacy',
                img: this.getImageUrl('intimacy'),
                name: intimacy.trim(),
                system: {
                  description: intimacy.trim(),
                  strength: intimacyStrength
                }
              }
            );
          }
        }
        if (addingIntimacies) {
          intimacyString += textArray[index].replace('Intimacies:', '');
        }
        else {
          actorDescription += textArray[index];
        }
        index++;
      }
      actorData.system.biography = actorDescription;
      if (textArray[index].includes('Caste') || textArray[index].includes('Aspect')) {
        this._getExaltSpecificData(textArray, index, actorData, false);
        index++;
      }
      var attributeString = textArray[index].replace('Attributes:', '');
      index++
      while (!textArray[index].includes("Essence")) {
        attributeString += " ";
        attributeString += textArray[index];
        index++
      }
      var attributeArray = attributeString.split(/,|;/);
      for (const attribute of attributeArray) {
        var attributeSpecificArray = attribute.trim().split(' ');
        var trimmedName = attributeSpecificArray[0].trim().toLowerCase();
        var value = parseInt(attributeSpecificArray[1].replace(/[^0-9]/g, ''));
        if(value > 5) {
          actorData.system.settings.usetenattributes = true;
        }
        actorData.system.attributes[trimmedName].value = value;
      }
      actorData.system.essence.value = parseInt(textArray[index].split(':')[1].replace(/[^0-9]/g, ''));
      index++;
      actorData.system.willpower.value = parseInt(textArray[index].split(':')[1].replace(/[^0-9]/g, ''));
      actorData.system.willpower.max = parseInt(textArray[index].split(':')[1].replace(/[^0-9]/g, ''));
      index++;
      //Join Battle dice should be auto calculated so itsn ot needed
      index++;
      var personalMotesValue = textArray[index].split(':')[1];
      if (personalMotesValue.toLowerCase().includes('committed')) {
        var personalSplitArray = personalMotesValue.split('(');
        actorData.system.motes.personal.value = parseInt(personalSplitArray[0].split('/')[0].replace(/[^0-9]/g, ''));
        actorData.system.motes.personal.max = parseInt(personalSplitArray[0].split('/')[1].replace(/[^0-9]/g, ''));
        actorData.system.motes.personal.committed = parseInt(personalSplitArray[0].split('/')[1].replace(/[^0-9]/g, '')) - parseInt(personalSplitArray[0].split('/')[0].replace(/[^0-9]/g, ''));
      }
      else {
        actorData.system.motes.personal.value = parseInt(personalMotesValue.replace(/[^0-9]/g, ''));
        actorData.system.motes.personal.max = parseInt(personalMotesValue.replace(/[^0-9]/g, ''));
      }
      index++;
      if (textArray[index].toLowerCase().includes('peripheral')) {
        var peripheralMotesValue = textArray[index].split(':')[1];
        if (peripheralMotesValue.toLowerCase().includes('committed')) {
          var peripheralSplitArray = peripheralMotesValue.split('(');
          actorData.system.motes.peripheral.value = parseInt(peripheralSplitArray[0].split('/')[0].replace(/[^0-9]/g, ''));
          actorData.system.motes.peripheral.max = parseInt(peripheralSplitArray[0].split('/')[1].replace(/[^0-9]/g, ''));
          actorData.system.motes.peripheral.committed = parseInt(peripheralSplitArray[0].split('/')[1].replace(/[^0-9]/g, '')) - parseInt(peripheralSplitArray[0].split('/')[0].replace(/[^0-9]/g, ''));
        }
        else {
          actorData.system.motes.peripheral.value = parseInt(peripheralMotesValue.replace(/[^0-9]/g, ''));
          actorData.system.motes.peripheral.max = parseInt(peripheralMotesValue.replace(/[^0-9]/g, ''));
        }
        index++;
      }
      this._getHealthLevels(textArray, index, actorData);
      index++;
      var abilityString = textArray[index].replace('Abilities:', '');
      index++;
      while (!textArray[index].includes("Merits") && !textArray[index].includes("Attack")) {
        abilityString += " ";
        abilityString += textArray[index];
        index++
      }
      var abilityArray = abilityString.split(/,|;/);
      for (let ability of abilityArray) {
        if (ability.includes('(')) {
          ability = ability.replace(/\([^()]*\)/g, "").replace("  ", " ");
        }
        if(ability.toLowerCase().includes('martial arts')) {
          trimmedName = 'martialarts';
          var value = parseInt(ability.replace(/[^0-9]/g, ''));
        }
        else {
          var abilitySpecificArray = ability.trim().split(' ');
          trimmedName = abilitySpecificArray[0].trim().toLowerCase();
          var value = parseInt(abilitySpecificArray[1].replace(/[^0-9]/g, ''));
        }
        actorData.system.abilities[trimmedName].value = value;
      
      }
      if (!textArray[index].includes("Attack")) {
        var meritString = textArray[index].replace('Merits:', '');
        index++;
        while (!textArray[index].includes("Attack")) {
          meritString += textArray[index];
          index++;
        }
        var meritArray = meritString.split(',');
        for (let merit of meritArray) {
          var meritValue = parseInt(merit.replace(/[^0-9]/g, ''));
          var meritName = merit.match(/[^0-9+]+/g)[0];
          itemData.push(
            {
              type: 'merit',
              img: this.getImageUrl('merit'),
              name: meritName.trim(),
              system: {
                points: meritValue ? meritValue : 0,
              }
            }
          );
        }
      }
      while (textArray[index].includes('Attack')) {
        var attackString = textArray[index];
        if (!textArray[index + 1].includes('Attack') && !textArray[index + 1].includes('Combat')) {
          attackString += textArray[index + 1];
          index++;
        }
        var weaponDescription = ''
        var tagSplit = attackString.replace('Attack ', '').split(';');
        if (tagSplit[1]) {
          weaponDescription = tagSplit[1].trim();
        }
        var attackArray = tagSplit[0].split(':');
        var attackName = attackArray[0].replace('(', '').replace(')', '');
        var damage = 1;
        var overwhelming = 1;
        var accuracy = 0;
        var accuracySplit = attackArray[1].trim().replace(')', '').split('(');
        accuracy = parseInt(accuracySplit[0].replace(/[^0-9]/g, ''));
        if (!attackString.toLowerCase().includes('grapple')) {
          var damageSplit = accuracySplit[1].split('Damage');
          if (damageSplit[1].includes('/')) {
            var damageSubSplit = damageSplit[1].split('/');
            damage = parseInt(damageSubSplit[0].replace(/[^0-9]/g, ''));
            overwhelming = parseInt(damageSubSplit[1].replace(/[^0-9]/g, ''));
          }
          else if (damageSplit[1].includes(',')) {
            var damageSubSplit = damageSplit[1].split(',');
            damage = parseInt(damageSubSplit[0].replace(/[^0-9]/g, ''));
            if (damageSplit[1].includes('minimum')) {
              overwhelming = parseInt(damageSubSplit[1].replace(/[^0-9]/g, ''));
            }
          }
          else if (damageSplit[1].includes(';')) {
            damage = parseInt(damageSplit[1].split(';')[0].replace(/[^0-9]/g, ''))
            weaponDescription = damageSplit[1].split(';')[1];
          }
          else {
            damage = parseInt(damageSplit[1].replace(/[^0-9]/g, ''));
          }
        }
        index++;
        itemData.push(
          {
            type: 'weapon',
            img: this.getImageUrl('weapon'),
            name: attackName.trim(),
            system: {
              description: weaponDescription,
              witheringaccuracy: accuracy,
              witheringdamage: damage,
              overwhelming: overwhelming,
            }
          }
        );
      }
      var combatString = textArray[index].replace('Combat:', '');
      index++;
      while (!textArray[index].includes("Social")) {
        combatString += textArray[index];
        index++;
      }
      var createArmor = false;
      var armorName = '';
      var armorValue = 0;
      var armorHardness = 0;
      var armorPenalty = 0;
      var combatArray = combatString.split(';');
      for (let combatStat of combatArray) {
        var armorStat = 0;
        var combatName = combatStat.match(/[^0-9+]+/g)[0];
        if (combatStat.includes('(')) {
          var armor = combatStat.match(/\(([^)]+)\)/)[1];
          armorStat = parseInt(armor.replace(/[^0-9]/g, ''));
          if (combatName.toLowerCase().trim() === 'soak' || combatName.toLowerCase().trim() === 'hardness' || combatName.toLowerCase().trim() === 'dodge') {
            createArmor = true;
            armorName = armor;
          }
          combatStat = combatStat.replace(/\([^()]*\)/g, "").replace("  ", " ");
        }
        var combatValue = parseInt(combatStat.replace(/[^0-9]/g, ''));
        if (combatName.toLowerCase().trim() === 'soak') {
          actorData.system.soak.value = combatValue;
          actorData.system.naturalsoak.value = combatValue;
          if (armorStat) {
            armorValue = armorStat;
          }
        }
        if (combatName.toLowerCase().trim() === 'hardness') {
          actorData.system.hardness.value = combatValue;
          if (armorStat) {
            armorHardness = armorStat;
          }
        }
        if (combatName.toLowerCase().trim() === 'dodge') {
          actorData.system.dodge.value = combatValue;
          if (armorStat) {
            armorPenalty = armorStat;
          }
        }
        if (combatName.toLowerCase().trim() === 'parry') {
          actorData.system.parry.value = combatValue;
        }
      }
      if (createArmor) {
        itemData.push(
          {
            type: 'armor',
            img: this.getImageUrl('armor'),
            name: armorName.trim(),
            system: {
              armorSoak: armorValue,
              hardness: armorHardness,
              penalty: armorPenalty,
            }
          }
        );
      }
      if (textArray[index].includes('Social')) {
        var socialArray = textArray[index].replace('Social:', '').split(',');
        for (var socialAbility of socialArray) {
          var attributeSpecificArray = socialAbility.trim().split(' ');
          if (attributeSpecificArray[0].toLocaleLowerCase().includes('resolve')) {
            actorData.system.resolve.value = parseInt(attributeSpecificArray[1].replace(/[^0-9]/g, ''));
          }
          if (attributeSpecificArray[0].toLocaleLowerCase().includes('guile')) {
            actorData.system.guile.value = parseInt(attributeSpecificArray[1].replace(/[^0-9]/g, ''));
          }
        }
        index++;
      }
      itemData.push(...this._getItemData(textArray, index, actorData));
      actorData.items = itemData;
      await Actor.create(actorData);
    }
    catch (error) {
      console.log(error);
      console.log(textArray);
      console.log(index);
      this.error = textArray[index];
      this.showError = true;
    }
  }

  getImageUrl(type) {
    if (type === 'intimacy') {
      return "systems/exalteddemake/assets/icons/hearts.svg";
    }
    if (type === 'spell') {
      return "systems/exalteddemake/assets/icons/magic-swirl.svg";
    }
    if (type === 'initiation') {
      return "icons/svg/book.svg";
    }
    if (type === 'merit') {
      return "icons/svg/coins.svg"
    }
    if (type === 'weapon') {
      return "icons/svg/sword.svg";
    }
    if (type === 'armor') {
      return "systems/exalteddemake/assets/icons/breastplate.svg";
    }
    if (type === 'charm') {
      return "icons/svg/explosion.svg";
    }
    if (type === 'specialability') {
      return "icons/svg/aura.svg";
    }
    if (type === 'craftproject') {
      return "systems/exalteddemake/assets/icons/anvil-impact.svg";
    }
  }

  activateListeners(html) {
    html.on("change", ".radio", ev => {
      if (document.getElementById("charm-radio").checked) {
        this.type = "charm";
      } else if (document.getElementById("spell-radio").checked) {
        this.type = "spell";
      } else if (document.getElementById("qc-radio").checked) {
        this.type = "qc";
      }
      else if (document.getElementById("adversary-radio").checked) {
        this.type = "adversary";
      }
      this.render();
    });

    html.find("#import-template").on("click", async (event) => {
      this.textBox = html.find('#template-text').val();
      this.showError = false;
      if (this.type === 'charm') {
        this.createCharm(html);
      } else if (this.type === 'spell') {
        this.createSpell(html);
      } else if (this.type === 'qc') {
        this.createQuickCharacter(html);
      }
      else if (this.type === 'adversary') {
        this.createAdversary(html);
      }
      this.render();
    });
  }
}

Hooks.on("renderItemDirectory", (app, html, data) => {
  const button = $(`<button class="tempalte-importer">${game.i18n.localize("ExD.CharmImport")}(BETA)</button>`);
  html.find(".directory-footer").append(button);

  button.click(ev => {
    game.templateImporter.type = "charm";
    game.templateImporter.render(true);
  })
})

Hooks.on("renderActorDirectory", (app, html, data) => {
  const button = $(`<button class="tempalte-importer">${game.i18n.localize("ExD.NPCImport")}(BETA)</button>`);
  html.find(".directory-footer").append(button);

  button.click(ev => {
    game.templateImporter.type = "qc";
    game.templateImporter.render(true);
  })
})

Hooks.on('init', () => {
  if (!game.templateImporter)
    game.templateImporter = new TemplateImporter();
})