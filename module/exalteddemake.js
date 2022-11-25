// Import Modules
import { exalteddemake } from "./config.js";

import { ExaltedDemakeActor } from "./actor/actor.js";
import { ExaltedDemakeActorSheet } from "./actor/actor-sheet.js";
import { ExaltedDemakeItem } from "./item/item.js";
import { ExaltedDemakeItemSheet } from "./item/item-sheet.js";

import { RollForm } from "./apps/dice-roller.js";
import TraitSelector from "./apps/trait-selector.js";
import { registerSettings } from "./settings.js";
import ItemSearch from "./apps/item-search.js";
import Importer from "./apps/importer.js";
import TemplateImporter from "./apps/template-importer.js";

Hooks.once('init', async function() {

  registerSettings();

  game.exalteddemake = {
    applications: {
      TraitSelector,
      ItemSearch,
      TemplateImporter,
      Importer,
    },
    entities: {
      ExaltedDemakeActor,
      ExaltedDemakeItem
    },
    config: exalteddemake,
    rollItemMacro: rollItemMacro,
    roll: roll,
    RollForm
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  // CONFIG.Combat.initiative = {
  //   formula: "1d10cs>=7",
  // };

  // Define custom Entity classes
  CONFIG.exalteddemake = exalteddemake;
  CONFIG.statusEffects = exalteddemake.statusEffects;

  CONFIG.Actor.documentClass = ExaltedDemakeActor;
  CONFIG.Item.documentClass = ExaltedDemakeItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("exalteddemake", ExaltedDemakeActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("exalteddemake", ExaltedDemakeItemSheet, { makeDefault: true });

  // Pre-load templates
  loadTemplates([
    "systems/exalteddemake/templates/dialogues/ability-base.html",
    "systems/exalteddemake/templates/dialogues/add-roll-charm.html",
    "systems/exalteddemake/templates/dialogues/accuracy-roll.html",
    "systems/exalteddemake/templates/dialogues/damage-roll.html",
    "systems/exalteddemake/templates/actor/active-effects.html",
    "systems/exalteddemake/templates/actor/equipment-list.html",
    "systems/exalteddemake/templates/actor/combat-tab.html",
    "systems/exalteddemake/templates/actor/charm-list.html",
    "systems/exalteddemake/templates/actor/social-tab.html",
  ]);

  Combatant.prototype._getInitiativeFormula = function() {
    const actor = this.actor;
    var initDice = 0;
    if (this.actor.type != 'npc') {
      initDice = actor.system.attributes.wits.value + actor.system.abilities.awareness.value + 2;
    }
    else {
      initDice = actor.system.pools.joinbattle.value;
    }
    let roll = new Roll(`${initDice}d10cs>=7 + 3`).evaluate({ async: false });
    let diceRoll = roll.total;
    let bonus = 0;
    for (let dice of roll.dice[0].results) {
      if (dice.result >= 10) {
          bonus++;
      }
    }
    return `${diceRoll + bonus}`;
  }

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  }); 

  Handlebars.registerHelper('numLoop', function (num, options) {
    let ret = ''

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  });

  Handlebars.registerHelper('numLoopCertainStart', function (num, startNum, options) {
    let ret = ''

    for (let i = startNum, j = num + startNum; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  });
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEquals', function (arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifGreater', function(arg1, arg2, options) {
  return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('le', function( a, b ){
  var next =  arguments[arguments.length-1];
  return (a <= b) ? next.fn(this) : next.inverse(this);
});

$(document).ready(() => {
  const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';

  $(document).on('click', diceIconSelector, ev => {
    ev.preventDefault();
    new RollForm(null, {event:ev}, {}, {rollType: 'base'}).render(true);
  });
});

Hooks.on('updateCombat', (async (combat, update, diff, userId) => {
  // Handle non-gm users.

  if (combat.current === undefined) {
    combat = game.combat;
  }

  if (update && update.round) {
    for(var combatant of combat.data.combatants) {
      const actorData = duplicate(combatant.actor)
      var missingPersonal = (actorData.system.motes.personal.max - actorData.system.motes.personal.committed) - actorData.system.motes.personal.value;
      var missingPeripheral = (actorData.system.motes.peripheral.max - actorData.system.motes.peripheral.committed) - actorData.system.motes.peripheral.value;
      var restorePersonal = 0;
      var restorePeripheral = 0;
      if(missingPeripheral >= 5) {
        restorePeripheral = 5;
      }
      else {
        if(missingPeripheral > 0) {
          restorePeripheral = missingPeripheral;
        }
        var maxPersonalRestore = 5 - restorePeripheral;
        if(missingPersonal > maxPersonalRestore) {
          restorePersonal = maxPersonalRestore;
        }
        else {
          restorePersonal = missingPersonal;
        }
      }
      actorData.system.motes.personal.value += restorePersonal;
      actorData.system.motes.peripheral.value += restorePeripheral;
      combatant.actor.update(actorData);
    }
  }
  if(update && (update.round || update.turn)) {
    if(combat.current.combatantId) {
      var currentCombatant = combat.data.combatants.get(combat.current.combatantId);
      const onslaught = currentCombatant.actor.effects.find(i => i.data.label == "Onslaught");
      if(onslaught) {
          onslaught.delete();
      }
    }
  }
}));

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createexalteddemakeMacro(data, slot));

  $("#chat-log").on("click", " .item-row", ev => {
    const li = $(ev.currentTarget).next();
    li.toggle("fast");
  });
  
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createexalteddemakeMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.exalteddemake.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "exalteddemake.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}

/**
 * 
 * @param {ExaltedDemakeActor} actor 
 * @param {object} object 
 * @param {object} data 
 * @returns {Promise}
 */
function roll(actor,object,data){
  return new RollForm(actor,object,{},data).roll();
}