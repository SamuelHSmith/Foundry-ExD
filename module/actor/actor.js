import { RollForm } from "../apps/dice-roller.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ExaltedDemakeActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this;
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
  }

  async displayEmbeddedItem(itemId) {
    // Render the chat card template
    let item = this.items.find(x=> x.id === itemId);
    if(!item){
      return ui.notifications.error(`${this.name} does not have an embedded item id ${itemId}!`);
    }
    const token = this.token;
    const templateData = {
      actor: this,
      tokenId: token?.uuid || null,
      item: item.system
    };
    const html = await renderTemplate("systems/exalteddemake/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this, token }),
    };


    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }

  async rollEmbeddedItem(itemId, personal = false) {

    const actorData = duplicate(this);

    let item = this.items.find(x=> x.id == itemId);

    if(!item){
      return ui.notifications.error(`${this.name} does not have an embedded item id ${itemId}!`);
    }

    if(item.type === 'charm') {
      if(item.system.cost.motes > 0) {
        if(data.data.motes.peripheral.value > 0 && !personal) {
          data.data.motes.peripheral.value = Math.max(0, data.data.motes.peripheral.value - item.system.cost.motes);
        }
        else {
          data.data.motes.personal.value = Math.max(0, data.data.motes.personal.value - item.system.cost.motes);
        }
      }
      data.data.willpower.value = Math.max(0, data.data.willpower.value - item.system.cost.willpower);
      if(this.type === 'character') {
        data.data.craft.experience.silver.value = Math.max(0, data.data.craft.experience.silver.value - item.system.cost.silverxp);
        data.data.craft.experience.gold.value = Math.max(0, data.data.craft.experience.gold.value - item.system.cost.goldxp);
        data.data.craft.experience.white.value = Math.max(0, data.data.craft.experience.white.value - item.system.cost.whitexp);
      }
      if(data.data.details.aura === item.system.cost.aura || item.system.cost.aura === 'any') {
        data.data.details.aura = "none";
      }
      if(item.system.cost.initiative > 0) {
        let combat = game.combat;
        if (combat) {
            let combatant = combat.data.combatants.find(c => c?.actor?.data?._id == this.id);
            if (combatant) {
                var newInitiative = combatant.initiative - item.system.cost.initiative;
                if(combatant.initiative > 0 && newInitiative <= 0) {
                  newInitiative -= 5;
                }
                combat.setInitiative(combatant.id, newInitiative);
            }
        }
      }
      if(item.system.cost.anima > 0) {
        var newLevel = data.data.anima.level;
        var newValue = data.data.anima.value;
        for(var i = 0; i < item.system.cost.anima; i++) {
          if (newLevel === "Transcendent") {
            newLevel = "Bonfire";
            newValue = 3;
          }
          else if (newLevel === "Bonfire") {
            newLevel = "Burning";
            newValue = 2;
          }
          else if (newLevel === "Burning") {
            newLevel = "Glowing";
            newValue = 1;
          }
          if (newLevel === "Glowing") {
            newLevel = "Dim";
            newValue = 0;
          }
        }
        data.data.anima.level = newLevel;
        data.data.anima.value = newValue;
      }
      if(item.system.cost.health > 0) {
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(data.data.health.levels)) {
          totalHealth += health_level.value;
        }
        if(item.system.cost.healthtype === 'bashing') {
          data.data.health.bashing = Math.min(totalHealth - data.data.health.aggravated - data.data.health.lethal, data.data.health.bashing + item.system.cost.health);
        }
        else if(item.system.cost.healthtype === 'lethal') {
          data.data.health.lethal = Math.min(totalHealth - data.data.health.bashing - data.data.health.aggravated, data.data.health.lethal + item.system.cost.health);
        }
        else {
          data.data.health.aggravated = Math.min(totalHealth - data.data.health.bashing - data.data.health.lethal, data.data.health.aggravated + item.system.cost.health);
        }
      }
    }
    if(item.type === 'spell') {
      data.data.sorcery.motes = 0;
    }

    this.displayEmbeddedItem(itemId);

    this.update(actorData);
  }

  async savedRoll(name){

    const roll = Object.values(this.system.savedRolls).find(x=>x. name === name);

    if(!roll){
      return ui.notifications.error(`${this.name} does not have a saved roll named ${name}!`);
    }


    await new RollForm(this, { event: this.event }, {}, { rollId: roll.id, skipDialog: true }).roll();
  }

  getSavedRoll(name){
    const roll = Object.values(this.system.savedRolls).find(x=>x. name === name);

    if(!roll){
      return ui.notifications.error(`${this.name} does not have a saved roll named ${name}!`);
    }

    return new RollForm(this, { event: this.event }, {}, { rollId: roll.id });
  }
  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    // Make modifications to data here. For example:

    const data = actorData.system;

    // this._prepareBaseActorData(data);
    let totalHealth = 0;
    let currentPenalty = 0;
    let totalWarstriderHealth = 0;
    let totalShipHealth = 0;
    let currentWarstriderPenalty = 0;
    let currentShipPenalty = 0;

    if(data.willpower.total !== 5 && data.willpower.max === 5) {
      data.willpower.max = data.willpower.total;
    }

    if (data.battlegroup) {
      totalHealth = data.health.levels.zero.value + data.size.value;
      data.health.max = totalHealth;
      if ((data.health.bashing + data.health.lethal + data.health.aggravated) > data.health.max) {
        data.health.aggravated = data.health.max - data.health.lethal;
        if (data.health.aggravated <= 0) {
          data.health.aggravated = 0
          data.health.lethal = data.health.max
        }
      }
      data.health.value = data.health.max - data.health.aggravated - data.health.lethal - data.health.bashing;
      data.health.penalty = 0;
    }
    else {
      for (let [key, health_level] of Object.entries(data.health.levels)) {
        if ((data.health.bashing + data.health.lethal + data.health.aggravated) > totalHealth) {
          currentPenalty = health_level.penalty;
        }
        totalHealth += health_level.value;
      }
      data.health.max = totalHealth;
      if ((data.health.bashing + data.health.lethal + data.health.aggravated) > data.health.max) {
        data.health.aggravated = data.health.max - data.health.lethal;
        if (data.health.aggravated <= 0) {
          data.health.aggravated = 0;
          data.health.lethal = data.health.max;
        }
      }
      data.health.value = data.health.max - data.health.aggravated - data.health.lethal - data.health.bashing;
      data.health.penalty = currentPenalty;
    }


    for (let [key, health_level] of Object.entries(data.warstrider.health.levels)) {
      if ((data.warstrider.health.bashing + data.warstrider.health.lethal + data.warstrider.health.aggravated) > totalWarstriderHealth) {
        currentWarstriderPenalty = health_level.penalty;
      }
      totalWarstriderHealth += health_level.value;
    }
    data.warstrider.health.max = totalWarstriderHealth;
    if ((data.warstrider.health.bashing + data.warstrider.health.lethal + data.warstrider.health.aggravated) > data.warstrider.health.max) {
      data.warstrider.health.aggravated = data.warstrider.health.max - data.warstrider.health.lethal;
      if (data.warstrider.health.aggravated <= 0) {
        data.warstrider.health.aggravated = 0;
        data.warstrider.health.lethal = data.health.max;
      }
    }
    data.warstrider.health.value = data.warstrider.health.max - data.warstrider.health.aggravated - data.warstrider.health.lethal - data.warstrider.health.bashing;
    data.warstrider.health.penalty = currentWarstriderPenalty;


    for (let [key, health_level] of Object.entries(data.ship.health.levels)) {
      if ((data.ship.health.bashing + data.ship.health.lethal + data.ship.health.aggravated) > totalShipHealth) {
        currentShipPenalty = health_level.penalty;
      }
      totalShipHealth += health_level.value;
    }
    data.ship.health.max = totalShipHealth;
    if ((data.ship.health.bashing + data.ship.health.lethal + data.ship.health.aggravated) > data.ship.health.max) {
      data.ship.health.aggravated = data.ship.health.max - data.ship.health.lethal;
      if (data.ship.health.aggravated <= 0) {
        data.ship.health.aggravated = 0;
        data.ship.health.lethal = data.health.max;
      }
    }
    data.ship.health.value = data.ship.health.max - data.ship.health.aggravated - data.ship.health.lethal - data.ship.health.bashing;
    data.ship.health.penalty = currentShipPenalty;

    if (actorData.type !== "npc") {
      data.experience.standard.spent = data.experience.standard.total - data.experience.standard.value;
      data.experience.exalt.spent = data.experience.exalt.total - data.experience.exalt.value;
    }

    // Initialize containers.
    const gear = [];
    const weapons = [];
    const armor = [];
    const merits = [];
    const intimacies = [];
    const initiations = [];
    const martialarts = [];
    const crafts = [];
    const specialAbilities = [];
    const craftProjects = [];
    const actions = [];


    const charms = {
      offensive: { name: 'ExD.Offensive', visible: false, list: [] },
      offsensive: { name: 'ExD.Offensive', visible: false, list: [] },
      defensive: { name: 'ExD.Defensive', visible: false, list: [] },
      social: { name: 'ExD.Social', visible: false, list: [] },
      mobility: { name: 'ExD.Mobility', visible: false, list: [] },
      strength: { name: 'ExD.Strength', visible: false, list: [] },
      dexterity: { name: 'ExD.Dexterity', visible: false, list: [] },
      stamina: { name: 'ExD.Stamina', visible: false, list: [] },
      charisma: { name: 'ExD.Charisma', visible: false, list: [] },
      manipulation: { name: 'ExD.Manipulation', visible: false, list: [] },
      appearance: { name: 'ExD.Appearance', visible: false, list: [] },
      perception: { name: 'ExD.Perception', visible: false, list: [] },
      intelligence: { name: 'ExD.Intelligence', visible: false, list: [] },
      wits: { name: 'ExD.Wits', visible: false, list: [] },
      archery: { name: 'ExD.Archery', visible: false, list: [] },
      athletics: { name: 'ExD.Athletics', visible: false, list: [] },
      awareness: { name: 'ExD.Awareness', visible: false, list: [] },
      brawl: { name: 'ExD.Brawl', visible: false, list: [] },
      bureaucracy: { name: 'ExD.Bureaucracy', visible: false, list: [] },
      craft: { name: 'ExD.Craft', visible: false, list: [] },
      empathy: { name: 'ExD.Empathy', visible: false, list: [] },
      investigation: { name: 'ExD.Investigation', visible: false, list: [] },
      larceny: { name: 'ExD.Larceny', visible: false, list: [] },
      linguistics: { name: 'ExD.Linguistics', visible: false, list: [] },
      lore: { name: 'ExD.Lore', visible: false, list: [] },
      martialarts: { name: 'ExD.MartialArts', visible: false, list: [] },
      medicine: { name: 'ExD.Medicine', visible: false, list: [] },
      melee: { name: 'ExD.Melee', visible: false, list: [] },
      occult: { name: 'ExD.Occult', visible: false, list: [] },
      performance: { name: 'ExD.Performance', visible: false, list: [] },
      presence: { name: 'ExD.Presence', visible: false, list: [] },
      resistance: { name: 'ExD.Resistance', visible: false, list: [] },
      ride: { name: 'ExD.Ride', visible: false, list: [] },
      sail: { name: 'ExD.Sail', visible: false, list: [] },
      socialize: { name: 'ExD.Socialize', visible: false, list: [] },
      stealth: { name: 'ExD.Stealth', visible: false, list: [] },
      survival: { name: 'ExD.Survival', visible: false, list: [] },
      thrown: { name: 'ExD.Thrown', visible: false, list: [] },
      war: { name: 'ExD.War', visible: false, list: [] },
      evocation: { name: 'ExD.Evocation', visible: false, list: [] },
      universal: { name: 'ExD.Universal', visible: false, list: [] },
      other: { name: 'ExD.Other', visible: false, list: [] },
    }

    const spells = {
      terrestrial: { name: 'ExD.Terrestrial', visible: false, list: [] },
      celestial: { name: 'ExD.Celestial', visible: false, list: [] },
      solar: { name: 'ExD.Solar', visible: false, list: [] },
    }

    // Iterate through items, allocating to containers
    for (let i of actorData.items) {

      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'weapon') {
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        armor.push(i);
      }
      else if (i.type === 'merit') {
        merits.push(i);
      }
      else if (i.type === 'intimacy') {
        intimacies.push(i);
      }
      else if (i.type === 'martialart') {
        martialarts.push(i);
      }
      else if (i.type === 'craft') {
        crafts.push(i);
      }
      else if (i.type === 'initiation') {
        initiations.push(i);
      }
      else if (i.type === 'specialability') {
        specialAbilities.push(i);
      }
      else if (i.type === 'craftproject') {
        craftProjects.push(i);
      }
      else if (i.type === 'charm') {
        if (i.system.ability !== undefined) {
          charms[i.system.ability].list.push(i);
          charms[i.system.ability].visible = true;
        }
      }
      else if (i.type === 'spell') {
        if (i.system.circle !== undefined) {
          spells[i.system.circle].list.push(i);
          spells[i.system.circle].visible = true;
        }
      }
      else if (i.type === 'action') {
        actions.push(i);
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.weapons = weapons;
    actorData.armor = armor;
    actorData.merits = merits;
    actorData.martialarts = martialarts;
    actorData.crafts = crafts;
    actorData.initiations = initiations;
    actorData.intimacies = intimacies;
    actorData.charms = charms;
    actorData.spells = spells;
    actorData.specialabilities = specialAbilities;
    actorData.projects = craftProjects;
    actorData.actions = actions;
  }
}
