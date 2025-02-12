export class RollForm extends FormApplication {
    constructor(actor, options, object, data) {
        super(object, options);
        this.actor = actor;

        if (data.rollId) {
            this.object = duplicate(this.actor.system.savedRolls[data.rollId]);
            this.object.skipDialog = data.skipDialog || true;
            this.object.isSavedRoll = true;
        }
        else {
            this.object.isSavedRoll = false;
            this.object.skipDialog = data.skipDialog || true;
            this.object.crashed = false;
            this.object.dice = data.dice || 0;
            this.object.successModifier = data.successModifier || 0;
            this.object.casteRoll = data.casteRoll || false;
            this.object.rollType = data.rollType;
            this.object.craftType = data.craftType || 0;
            this.object.craftRating = data.craftRating || 0;
            this.object.showPool = data.rollType === "attack";
            this.object.showWithering = data.rollType === 'withering' || data.rollType === 'damage';
            this.object.goalNumber = 0;
            this.object.woundPenalty = this.object.rollType === 'base' ? false : true;
            this.object.intervals = 0;
            this.object.difficulty = data.difficulty || 0;
            this.object.isMagic = data.isMagic || false;
            this.object.diceModifier = 0;
            this.object.accuracy = data.accuracy || 0;
            this.object.botch = false;

            this.object.baseDamage = data.baseDamage || 0;
            this.object.overwhelming = data.overwhelming || 0;
            this.object.soak = 0;
            this.object.armoredSoak = 0;
            this.object.naturalSoak = 0;
            this.object.defense = 0;
            this.object.characterInitiative = 0;
            this.object.gambitDifficulty = 0;

            this.object.weaponType = data.weaponType || 'melee';
            this.object.attackType = data.attackType || 'withering';
            this.object.range = 'close';

            this.object.isFlurry = false;
            this.object.armorPenalty = false;
            this.object.willpower = false;

            this.object.supportedIntimacy = 0;
            this.object.opposedIntimacy = 0;

            this.object.onesSubtract = true;
            this.object.rerollFailed = false;
            this.object.difficulty = 6;
            this.object.rerollNumber = 0;
            this.object.attackSuccesses = 0;

            this.object.reroll = {
                one: { status: false, number: 1 },
                two: { status: false, number: 2 },
                three: { status: false, number: 3 },
                four: { status: false, number: 4 },
                five: { status: false, number: 5 },
                six: { status: false, number: 6 },
                seven: { status: false, number: 7 },
                eight: { status: false, number: 8 },
                nine: { status: false, number: 9 },
                ten: { status: false, number: 10 },
            }

            this.object.damage = {
                damageDice: data.damage || 0,
                damageSuccessModifier: data.damageSuccessModifier || 0,
                difficulty: data.difficulty || 6,
                postSoakDamage: 0,
                reroll: {
                    one: { status: false, number: 1 },
                    two: { status: false, number: 2 },
                    three: { status: false, number: 3 },
                    four: { status: false, number: 4 },
                    five: { status: false, number: 5 },
                    six: { status: false, number: 6 },
                    seven: { status: false, number: 7 },
                    eight: { status: false, number: 8 },
                    nine: { status: false, number: 9 },
                    ten: { status: false, number: 10 },
                },
                type: 'lethal',
                threshholdToDamage: false,
            };
            if (this.object.rollType !== 'base') {
                this.object.characterType = this.actor.type;

                this.object.conditions = (this.actor.token && this.actor.token.actorData.effects) ? this.actor.token.actorData.effects : [];
                if (this.actor.type === 'character') {
                    this.object.attribute = data.attribute || this._getHighestAttribute();
                    this.object.ability = data.ability || "archery";
                    this.object.appearance = this.actor.system.attributes.appearance.value;
                }

                if (this.actor.type === "npc") {
                    if (this.object.rollType === 'action') {
                        this.object.actionRoll = true;
                        this.object.actionId = data.actionId;
                        this.object.actions = this.actor.actions;
                    }
                    else {
                        this.object.pool = data.pool || "administration";
                    }
                    this.object.appearance = this.actor.system.appearance.value;
                }
                this.object.difficultyString = 'ExD.Difficulty';
                if (this.object.rollType === 'readIntentions') {
                    this.object.difficultyString = 'ExD.Guile';
                }
                if (this.object.rollType === 'social') {
                    this.object.difficultyString = 'ExD.Resolve';
                }

                if (this.object.rollType === 'craft') {
                    this.object.intervals = 1;
                    this.object.finished = false;
                    this.object.objectivesCompleted = 0;

                    if (this.object.craftType === 'superior') {
                        this.object.intervals = 6;
                        this.object.difficulty = 5;
                        if (this.object.craftRating === 2) {
                            this.object.goalNumber = 30;
                        }
                        if (this.object.craftRating === 3) {
                            this.object.goalNumber = 50;
                        }
                        if (this.object.craftRating === 4) {
                            this.object.goalNumber = 75;
                        }
                        if (this.object.craftRating === 5) {
                            this.object.goalNumber = 100;
                        }
                    }
                    else if (this.object.craftType === 'legendary') {
                        this.object.intervals = 6;
                        this.object.difficulty = 5;
                        this.object.goalNumber = 200;
                    }
                }
                this.object.finesse = 1;
                this.object.ambition = 5;

                if (this.object.rollType === 'working') {
                    this.object.difficulty = 1;
                    this.object.intervals = 5;
                    this.object.goalNumber = 5;
                }

                if (this.object.rollType === 'attack') {
                    if (this.object.conditions.some(e => e.name === 'prone')) {
                        this.object.diceModifier -= 3;
                    }
                    if (this.object.conditions.some(e => e.name === 'grappled')) {
                        this.object.diceModifier -= 1;
                    }
                }
            }
        }
        this.object.addingCharms = false;
        if (this.object.cost === undefined) {
            this.object.cost = {
                motes: 0,
                muteMotes: 0,
                willpower: 0,
                initiative: 0,
                anima: 0,
                healthbashing: 0,
                healthlethal: 0,
                healthaggravated: 0,
                silverxp: 0,
                goldxp: 0,
                whitexp: 0,
                aura: "",
            }
        }
        if (this.object.damage.type === undefined) {
            this.object.damage.type = 'lethal';
        }
        if (this.object.damage.threshholdToDamage === undefined) {
            this.object.damage.threshholdToDamage = false;
        }
        if (this.object.addedCharms === undefined) {
            this.object.addedCharms = [];
        }
        if (this.object.diceCap === undefined) {
            this.object.diceCap = this._getDiceCap();
        }
        if (this.object.diceToSuccesses === undefined) {
            this.object.diceToSuccesses = 0;
        }
        if (this.object.rollType !== 'base') {
            this.object.target = Array.from(game.user.targets)[0] || null;
            this.object.targetCombatant = game.combat?.combatants?.find(c => c.actorId == this.object.target?.actor.id) || null;
            this.object.showDefenseOnDamage = game.settings.get("exalteddemake", "defenseOnDamage");

            let combat = game.combat;
            if (combat) {
                let combatant = combat.combatants.find(c => c.actorId == actor.id);
                if (combatant && combatant.initiative) {
                    if (!this.object.showWithering) {
                        this.object.damage.damageDice = combatant.initiative;
                    }
                    this.object.characterInitiative = combatant.initiative;
                }
            }
            if (this.object.target) {
                if (this.object.rollType === 'social' || this.object.rollType === 'readIntentions') {
                    if (this.object.rollType === 'readIntentions') {
                        this.object.difficulty = this.object.target.actor.system.guile.value;
                    }
                    if (this.object.rollType === 'social') {
                        this.object.difficulty = this.object.target.actor.system.resolve.value;
                    }
                }
                if (this.object.target.actor.system.parry.value >= this.object.target.actor.system.dodge.value) {
                    this.object.defense = this.object.target.actor.system.parry.value;
                    if (this.object.target.actor.effects && this.object.target.actor.effects.some(e => e.name === 'prone')) {
                        this.object.defense -= 1;
                    }
                }
                else {
                    this.object.defense = this.object.target.actor.system.dodge.value;
                    if (this.object.target.actor.effects && this.object.target.actor.effects.some(e => e.name === 'prone')) {
                        this.object.defense -= 2;
                    }
                }
                if (this.object.target.actor.system.warstrider.equipped) {
                    this.object.soak = this.object.target.actor.system.warstrider.soak.value;
                }
                else {
                    this.object.soak = this.object.target.actor.system.soak.value;
                    this.object.armoredSoak = this.object.target.actor.system.armoredsoak.value;
                    this.object.naturalSoak = this.object.target.actor.system.naturalsoak.value;
                }
                if (this.object.target.actor.effects) {
                    if (this.object.target.actor.effects.some(e => e.name === 'lightcover')) {
                        this.object.defense += 1;
                    }
                    if (this.object.target.actor.effects.some(e => e.name === 'heavycover')) {
                        this.object.defense += 2;
                    }
                    if (this.object.target.actor.effects.some(e => e.name === 'grappled') || this.object.target.actor.effects.some(e => e.name === 'grappling')) {
                        this.object.defense -= 2;
                    }
                }
            }
        }
    }

    /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
    get template() {
        var template = "systems/exalteddemake/templates/dialogues/ability-roll.html";
        if (this.object.rollType === 'base') {
            template = "systems/exalteddemake/templates/dialogues/dice-roll.html";
        }
        else if (this.object.rollType === 'attack') {
            template = "systems/exalteddemake/templates/dialogues/attack-roll.html";
        }
        return template;
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        // Token Configuration
        if (this.object.rollType !== 'base') {
            const charmsButton = {
                label: game.i18n.localize('ExD.AddCharm'),
                class: 'add-charm',
                id: "add-charm",
                icon: 'fas fa-bolt',
                onclick: (ev) => {
                    this.object.charmList = this.actor.charms;
                    for (var charmlist of Object.values(this.object.charmList)) {
                        for (const charm of charmlist.list) {
                            if (this.object.addedCharms.some((addedCharm) => addedCharm._id === charm._id)) {
                                charm.charmAdded = true;
                            }
                            else {
                                charm.charmAdded = false;
                            }
                        }
                    }
                    if (this.object.addingCharms) {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('ExD.AddCharm')}`;
                    }
                    else {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('ExD.Done')}`;
                    }
                    this.object.addingCharms = !this.object.addingCharms;
                    this.render();
                },
            };
            buttons = [charmsButton, ...buttons];
            const rollButton = {
                label: this.object.id ? game.i18n.localize('ExD.Update') : game.i18n.localize('ExD.Save'),
                class: 'roll-dice',
                icon: 'fas fa-dice-d6',
                onclick: (ev) => {
                    this._saveRoll(this.object);
                },
            };
            buttons = [rollButton, ...buttons];
        }

        return buttons;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["dialog", `solar-background`],
            popOut: true,
            template: "systems/exalteddemake/templates/dialogues/dice-roll.html",
            id: "roll-form",
            title: `Roll`,
            width: 350,
            resizable: true,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }


    resolve = function (value) { return value };

    get resolve() {
        return this.resolve
    }

    set resolve(value) {
        this.resolve = value;
    }

    /**
     * Renders out the Roll form.
     * @returns {Promise} Returns True or False once the Roll or Cancel buttons are pressed.
     */
    async roll() {
        if (this.object.skipDialog) {
            await this._roll();
            return true;
        } else {
            var _promiseResolve;
            this.promise = new Promise(function (promiseResolve) {
                _promiseResolve = promiseResolve
            });
            this.resolve = _promiseResolve;
            this.render(true);
            return this.promise;
        }
    }

    async _saveRoll(rollData) {
        let html = await renderTemplate("systems/exalteddemake/templates/dialogues/save-roll.html", { 'name': this.object.name || 'New Roll' });
        new Dialog({
            title: "Save Roll",
            content: html,
            default: 'save',
            buttons: {
                save: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Save',
                    default: true,
                    callback: html => {
                        let results = document.getElementById('name').value;
                        let uniqueId = this.object.id || randomID(16);
                        rollData.name = results;
                        rollData.id = uniqueId;
                        rollData.target = null;

                        let updates = {
                            "data.savedRolls": {
                                [uniqueId]: rollData
                            }
                        };
                        this.actor.update(updates);
                        this.saved = true;
                        ui.notifications.notify(`Saved Roll`);
                        return;
                    },
                }
            }
        }).render(true);
    }

    getData() {
        return {
            actor: this.actor,
            data: this.object,
        };
    }

    async _updateObject(event, formData) {
        mergeObject(this, formData);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("change", "#working-finesse", ev => {
            this.object.difficulty = parseInt(this.object.finesse);
            this.render();
        });

        html.on("change", "#working-ambition", ev => {
            this.object.goalNumber = parseInt(this.object.ambition);
            this.render();
        });

        html.find('#roll-button').click((event) => {
            this._roll();
            if (this.object.intervals <= 0) {
                this.resolve(true);
                this.close();
            }
        });

        html.find('#save-button').click((event) => {
            this._saveRoll(this.object);
            if (this.object.intervals <= 0) {
                this.close();
            }
        });

        html.find('.add-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            this.object.addedCharms.push(item);
            for (var charmlist of Object.values(this.object.charmList)) {
                for (const charm of charmlist.list) {
                    if (this.object.addedCharms.some((addedCharm) => addedCharm._id === charm._id)) {
                        charm.charmAdded = true;
                    }
                }
            }
            if (item.system.keywords.toLowerCase().includes('mute')) {
                this.object.cost.muteMotes += item.system.cost.motes;
            }
            else {
                this.object.cost.motes += item.system.cost.motes;
            }
            this.object.cost.anima += item.system.cost.anima;
            this.object.cost.willpower += item.system.cost.willpower;
            this.object.cost.silverxp += item.system.cost.silverxp;
            this.object.cost.goldxp += item.system.cost.goldxp;
            this.object.cost.whitexp += item.system.cost.whitexp;
            this.object.cost.initiative += item.system.cost.initiative;

            if (item.system.cost.aura) {
                this.object.cost.aura = item.system.cost.aura;
            }

            if (item.system.cost.health > 0) {
                if (item.system.cost.healthtype === 'bashing') {
                    this.object.cost.healthbashing += item.system.cost.health;
                }
                else if (item.system.cost.healthtype === 'lethal') {
                    this.object.cost.healthlethal += item.system.cost.health;
                }
                else {
                    this.object.cost.healthaggravated += item.system.cost.health;
                }
            }
            this.object.diceModifier += item.system.diceroller.bonusdice;
            this.object.successModifier += item.system.diceroller.bonussuccesses;
            if (item.system.diceroller.difficulty < this.object.damage.difficulty) {
                this.object.difficulty = item.system.diceroller.difficulty;
            }
            for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.reroll)) {
                if (rerollValue) {
                    this.object.reroll[rerollKey].status = true;
                }
            }
            if (item.system.diceroller.rerollfailed) {
                this.object.rerollFailed = item.system.diceroller.rerollfailed;
            }
            this.object.rerollNumber += item.system.diceroller.rerolldice;
            this.object.diceToSuccesses += item.system.diceroller.diceToSuccesses;

            this.object.damage.damageDice += item.system.diceroller.damage.bonusdice;
            this.object.damage.damageSuccessModifier += item.system.diceroller.damage.bonussuccesses;
            if (item.system.diceroller.damage.difficulty < this.object.damage.difficulty) {
                this.object.damage.difficulty = item.system.diceroller.damage.difficulty;
            }
            this.object.overwhelming += item.system.diceroller.damage.overwhelming;
            this.object.damage.postSoakDamage += item.system.diceroller.damage.postsoakdamage;
            for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.reroll)) {
                if (rerollValue) {
                    this.object.damage.reroll[rerollKey].status = true;
                }
            }
            if(item.system.diceroller.damage.threshholdtodamage) {
                this.object.damage.threshholdToDamage = item.system.diceroller.damage.threshholdtodamage;
            }

            this.render();
        });

        html.find('.remove-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            const index = this.object.addedCharms.findIndex(addedItem => item.id === addedItem._id);
            if (index > -1) {
                for (var charmlist of Object.values(this.object.charmList)) {
                    for (const charm of charmlist.list) {
                        if (charm._id === item.id) {
                            charm.charmAdded = false;
                        }
                    }
                }
                this.object.addedCharms.splice(index, 1);

                if (item.system.keywords.toLowerCase().includes('mute')) {
                    this.object.cost.muteMotes -= item.system.cost.motes;
                }
                else {
                    this.object.cost.motes -= item.system.cost.motes;
                }
                this.object.cost.anima -= item.system.cost.anima;
                this.object.cost.willpower -= item.system.cost.willpower;
                this.object.cost.silverxp -= item.system.cost.silverxp;
                this.object.cost.goldxp -= item.system.cost.goldxp;
                this.object.cost.whitexp -= item.system.cost.whitexp;
                this.object.cost.initiative -= item.system.cost.initiative;

                if (item.system.cost.aura === this.object.cost.aura) {
                    this.object.cost.aura = "";
                }

                if (item.system.cost.health > 0) {
                    if (item.system.cost.healthtype === 'bashing') {
                        this.object.cost.healthbashing -= item.system.cost.health;
                    }
                    else if (item.system.cost.healthtype === 'lethal') {
                        this.object.cost.healthlethal -= item.system.cost.health;
                    }
                    else {
                        this.object.cost.healthaggravated -= item.system.cost.health;
                    }
                }
                this.object.diceModifier -= item.system.diceroller.bonusdice;
                this.object.successModifier -= item.system.diceroller.bonussuccesses;
                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.reroll)) {
                    if (rerollValue) {
                        this.object.reroll[rerollKey].status = false;
                    }
                }
                if (item.system.diceroller.rerollfailed) {
                    this.object.rerollFailed = false;
                }
                this.object.rerollNumber -= item.system.diceroller.rerolldice;
                this.object.diceToSuccesses -= item.system.diceroller.diceToSuccesses;

                this.object.damage.damageDice -= item.system.diceroller.damage.bonusdice;
                this.object.damage.damageSuccessModifier -= item.system.diceroller.damage.bonussuccesses;
                this.object.overwhelming -= item.system.diceroller.damage.overwhelming;
                this.object.damage.postSoakDamage -= item.system.diceroller.damage.postsoakdamage;
                for (let [rerollKey, rerollValue] of Object.entries(item.system.diceroller.damage.reroll)) {
                    if (rerollValue) {
                        this.object.damage.reroll[rerollKey].status = false;
                    }
                }
                if(item.system.diceroller.damage.threshholdtodamage) {
                    this.object.damage.threshholdToDamage = false;
                }
            }
            this.render();
        });

        html.find('#done-adding-charms').click(ev => {
            this.object.addingCharms = false;
            this.render();
        });

        html.on("change", ".update-roller", ev => {
            this.object.diceCap = this._getDiceCap();
            this.render();
        });

        html.find('#cancel').click((event) => {
            this.resolve(false);
            this.close();
        });

        html.find('.collapsable').click(ev => {
            const li = $(ev.currentTarget).next();
            li.toggle("fast");
        });
    }

    async _roll() {
        if (this.object.rollType === 'attack') {
            await this._attackRoll();
        }
        else if (this.object.rollType === 'base') {
            await this._diceRoll();
        }
        else if (this.object.rollType === 'craft' || this.object.rollType === 'working') {
            await this._completeCraftProject();
        }
        else {
            await this._abilityRoll();
        }
    }

    async _baseAbilityDieRoll() {
        let dice = 0;

        if (this.object.rollType === 'base') {
            dice = this.object.dice;
        }
        else {
            const data = this.actor.system;
            const actorData = duplicate(this.actor);
            if (this.actor.type === 'character') {
                let attributeDice = data.attributes[this.object.attribute].value;
                let abilityDice = data.abilities[this.object.ability].value;
                dice = attributeDice + abilityDice;
            }
            else if (this.actor.type === 'npc' && !this.object.rollType === 'attack') {
                if (this.object.rollType === 'action') {
                    dice = this.actor.actions.find(x => x._id === this.object.actionId).system.value;
                }
                else {
                    let poolDice = data.pools[this.object.pool].value;
                    dice = poolDice;
                }
            }

            if (this.object.armorPenalty) {
                for (let armor of this.actor.armor) {
                    if (armor.system.equiped) {
                        dice = dice - Math.abs(armor.system.penalty);
                    }
                }
            }
            if (this.object.willpower) {
                this.object.difficulty--;
                actorData.system.willpower.value--;
            }
            if (this.object.diceToSuccesses > 0) {
                this.object.successModifier += Math.min(dice, this.object.diceToSuccesses);
                dice = Math.max(0, dice - this.object.diceToSuccesses);
            }
            if (this.object.woundPenalty && data.health.penalty !== 'inc') {
                if (data.warstrider.equipped) {
                    dice -= data.warstrider.health.penalty;
                }
                else {
                    dice -= data.health.penalty;
                }
            }
            if (this.object.diceModifier) {
                dice += this.object.diceModifier;
            }
            this.object.difficulty = Math.min(9,Math.max(1,this.object.difficulty));
            this.actor.update(actorData);
        }

        if (this.object.rollType === 'attack') {
            dice += this.object.accuracy || 0;
            if (this.object.weaponType !== 'melee' && (this.actor.type === 'npc' || this.object.rollType === 'withering')) {
                if (this.object.range !== 'short') {
                    dice += this._getRangedAccuracy();
                }
            }
        }

        let rerollString = '';
        let rerolls = [];

        for (var rerollValue in this.object.reroll) {
            if (this.object.reroll[rerollValue].status) {
                rerollString += `x${this.object.reroll[rerollValue].number}`;
                rerolls.push(this.object.reroll[rerollValue].number);
            }
        }

        dice = Math.max(1,dice);

        let roll = new Roll(`${dice}d10${rerollString}${this.object.rerollFailed ? `r<${this.object.difficulty}` : ""}cs>=${this.object.difficulty}`).evaluate({ async: false });
        let diceRoll = roll.dice[0].results;
        let getDice = "";
        let bonus = 0;
        let botch = false;
        let total = 0;
        let rerolledDice = 0;
        var failedDice = Math.min(dice - roll.total, this.object.rerollNumber);

        while (failedDice !== 0 && (rerolledDice < this.object.rerollNumber)) {
            rerolledDice += failedDice;
            var failedDiceRoll = new Roll(`${failedDice}d10cs>=${this.object.difficulty}`).evaluate({ async: false });
            failedDice = Math.min(failedDice - failedDiceRoll.total, (this.object.rerollNumber - rerolledDice));
            diceRoll = diceRoll.concat(failedDiceRoll.dice[0].results);
            total += failedDiceRoll.total;
        }

        for (let dice of diceRoll) {
            if (dice.result >= this.object.doubleSuccess) {
                bonus++;
                getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= this.object.difficulty) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.result == 1) { 
                if (!this.object.casteRoll){bonus--;}
                getDice += `<li class="roll die d10 failure">${dice.result}</li>`; 
            }
            else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
        }

        total += roll.total;
        total += bonus;
        total += this.object.successModifier;

        if (roll.total < 1 && bonus < 0){
            botch = true;
        }

        this.object.dice = dice;
        this.object.roll = roll;
        this.object.getDice = getDice;
        this.object.total = total;
        this.object.botch = botch
        if (this.object.rollType !== 'base') {
            this._spendMotes();
        }
    }

    async _diceRoll() {
        this._baseAbilityDieRoll();
        let successMessage = (this.object.botch)? "Botch!" : `${this.object.total} Successes`
        let messageContent = `<div class="chat-card">
                        <div class="card-content">Dice Roll</div>
                        <div class="card-buttons">
                            <div class="flexrow 1">
                                <div>Dice Roller - Number of Successes<div class="dice-roll">
                                        <div class="dice-result">
                                            <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                                            <div class="dice-tooltip">
                                                <div class="dice">
                                                    <ol class="dice-rolls">${this.object.getDice}</ol>
                                                </div>
                                            </div>
                                            <h4 class="dice-total">${successMessage}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        ChatMessage.create({ user: game.user.id, speaker: this.actor !== null ? ChatMessage.getSpeaker({ actor: this.actor }) : null, content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
    }

    async _abilityRoll() {
        if (this.actor.type === "npc") {
            if (this.object.ability === "archery") {
                this.object.ability = "primary";
            }
        }
        if (this.object.attribute == null) {
            this.object.attribute = this.actor.type === "npc" ? null : this._getHighestAttribute();
        }
        if (this.object.rollType === 'social') {
            this.object.difficulty = Math.max(0, this.object.difficulty + parseInt(this.object.opposedIntimacy || 0) - parseInt(this.object.supportedIntimacy || 0));
        }
        let goalNumberLeft = 0;
        this._baseAbilityDieRoll();
        let resultString = ``;

        if (this.object.rollType === "joinBattle") {
            resultString = `<h4 class="dice-total">${this.object.total + 3} Initiative</h4>`;
        }
        let successMessage = (this.object.botch)? "Botch!" : `${this.object.total} Successes`
        let theContent = `
  <div class="chat-card">
      <div class="card-content">Dice Roll</div>
      <div class="card-buttons">
          <div class="flexrow 1">
              <div>Dice Roller - Number of Successes<div class="dice-roll">
                      <div class="dice-result">
                          <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                          <div class="dice-tooltip">
                              <div class="dice">
                                  <ol class="dice-rolls">${this.object.getDice}</ol>
                              </div>
                          </div>
                          <h4 class="dice-total">${successMessage}</h4>
                          ${resultString}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: theContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: this.object.roll,
            flags: {
                "exalteddemake": {
                    dice: this.object.dice,
                    successModifier: this.object.successModifier,
                    total: this.object.total
                }
            }
        });
        if (this.object.rollType === "joinBattle") {
            let combat = game.combat;
            if (combat) {
                let combatant = combat.combatants.find(c => c.actorId == this.actor.id);
                if (combatant) {
                    combat.setInitiative(combatant.id, this.object.total + 3);
                }
            }
        }
        if (this.object.rollType === "sorcery") {
            const actorData = duplicate(this.actor);
            actorData.system.sorcery.motes += this.object.total;
            this.actor.update(actorData);
        }
    }

    async _attackRoll() {
        this._baseAbilityDieRoll();
        this.object.thereshholdSuccesses = this.object.total;
        let damageDiceText = '';
        let rerollString = '';
        let damageDoneText = "Miss";
        let damageDiceCnt = 0;

        // perform a damage roll automatically
        if (this.object.total > 0) {
            damageDiceCnt = this.object.thereshholdSuccesses + this.object.baseDamage;
            let roll = new Roll(`${damageDiceCnt}d10${rerollString}${this.object.rerollFailed ? `r<6` : ""}cs>=6`).evaluate({ async: false });
            let diceRoll = roll.dice[0].results;

            for (let dice of diceRoll) {
                if (dice.result >= this.object.doubleSuccess) {
                    damageDiceText += `<li class="roll die d10 success double-success">${dice.result}</li>`;
                }
                else if (dice.result >= this.object.difficulty) { damageDiceText += `<li class="roll die d10 success">${dice.result}</li>`; }
                else if (dice.result == 1) { 
                    damageDiceText += `<li class="roll die d10 failure">${dice.result}</li>`; 
                }
                else { damageDiceText += `<li class="roll die d10">${dice.result}</li>`; }
            }

            damageDoneText = `${this.object.total} Damage`
        }

        let successMessage = (this.object.botch)? "Botch!" : `${this.object.total} Successes`
        let messageContent = `<div class="chat-card">
                        <div class="card-content">Dice Roll</div>
                        <div class="card-buttons">
                            <div class="flexrow 1">
                                <div>Dice Roller - Number of Successes<div class="dice-roll">
                                        <div class="dice-result">
                                            <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                                            <div class="dice-tooltip">
                                                <div class="dice">
                                                    <ol class="dice-rolls">${this.object.getDice}</ol>
                                                </div>
                                            </div>
                                            <h4 class="dice-total">${successMessage}</h4>
                                            <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshold Dice + ${this.object.baseDamage} Base Damage</h4>
                                            <div class="dice-tooltip">
                                                <div class="dice">
                                                    <ol class="dice-rolls">${damageDiceText}</ol>
                                                </div>
                                            </div>
                                            <h4 class="dice-total">${damageDoneText}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
                    ChatMessage.create({ user: game.user.id, speaker: this.actor !== null ? ChatMessage.getSpeaker({ actor: this.actor }) : null, content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
    }

    // async _attackRoll() {
    //     // Accuracy
    //     if (this.object.rollType !== 'damage') {
    //         this._accuracyRoll();
    //     }
    //     else {
    //         this.object.thereshholdSuccesses = 0;
    //     }
    //     if ((this.object.thereshholdSuccesses >= 0 && this.object.rollType !== 'accuracy') || this.object.rollType === 'damage') {
    //         this._damageRoll();
    //     }
    //     else {
    //         if (this.object.thereshholdSuccesses < 0) {
    //             if (this.object.rollType !== 'withering') {
    //                 if (this.object.characterInitiative < 11) {
    //                     this.object.characterInitiative = this.object.characterInitiative - 2;
    //                 }
    //                 else {
    //                     this.object.characterInitiative = this.object.characterInitiative - 3;
    //                 }
    //             }
    //             var messageContent = `
    //             <div class="chat-card">
    //                 <div class="card-content">Attack Roll</div>
    //                 <div class="card-buttons">
    //                     <div class="flexrow 1">
    //                         <div>
    //                             <div class="dice-roll">
    //                                 <div class="dice-result">
    //                                     <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
    //                                     <div class="dice-tooltip">
    //                                         <div class="dice">
    //                                             <ol class="dice-rolls">${this.object.getDice}</ol>
    //                                         </div>
    //                                     </div>
    //                                     <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
    //                                     <h4 class="dice-total">Attack Missed!</h4>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //           `;
    //             ChatMessage.create({
    //                 user: game.user.id,
    //                 speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //                 content: messageContent,
    //                 type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll,
    //                 flags: {
    //                     "exalteddemake": {
    //                         dice: this.object.dice,
    //                         successModifier: this.object.successModifier,
    //                         total: this.object.total,
    //                         defense: this.object.defense,
    //                         threshholdSuccesses: this.object.thereshholdSuccesses
    //                     }
    //                 }
    //             });
    //             this._addOnslaught();
    //         }
    //     }
    //     if (this.object.rollType === 'accuracy') {
    //         var messageContent = `
    //         <div class="chat-card">
    //             <div class="card-content">Accuracy Roll</div>
    //             <div class="card-buttons">
    //                 <div class="flexrow 1">
    //                     <div>
    //                         <div class="dice-roll">
    //                             <div class="dice-result">
    //                                 <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
    //                                 <div class="dice-tooltip">
    //                                     <div class="dice">
    //                                         <ol class="dice-rolls">${this.object.getDice}</ol>
    //                                     </div>
    //                                 </div>
    //                                 <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
    //                                 <h4 class="dice-formula">${this.object.thereshholdSuccesses} Threshhold Successes</h4>
    //                                 ${this.object.thereshholdSuccesses < 0 ? '<h4 class="dice-total">Attack Missed!</h4>' : ''}
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //       `;
    //         ChatMessage.create({
    //             user: game.user.id,
    //             speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //             content: messageContent,
    //             type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    //             roll: this.object.roll,
    //             flags: {
    //                 "exalteddemake": {
    //                     dice: this.object.dice,
    //                     successModifier: this.object.successModifier,
    //                     total: this.object.total,
    //                     defense: this.object.defense,
    //                     threshholdSuccesses: this.object.thereshholdSuccesses
    //                 }
    //             }
    //         });
    //         if (this.object.thereshholdSuccesses < 0) {
    //             this._addOnslaught();
    //         }
    //     }
    // }

    // async _accuracyRoll() {
    //     this._baseAbilityDieRoll();
    //     this.object.thereshholdSuccesses = this.object.total - this.object.defense;
    // }

    // async _damageRoll() {
    //     let baseDamage = this.object.damage.damageDice;
    //     let dice = this.object.damage.damageDice;
    //     if (this.object.rollType === 'damage' && this.object.attackType === 'withering' && game.settings.get("exalteddemake", "defenseOnDamage")) {
    //         dice += this.object.attackSuccesses;
    //         dice -= this.object.defense;
    //     }
    //     var damageResults = ``;

    //     if(this._damageRollType('withering') || this.object.damage.threshholdToDamage) {
    //         dice += this.object.thereshholdSuccesses;
    //         baseDamage = dice;
    //     }

    //     if (this._damageRollType('decisive')) {
    //         if (this.object.target && game.combat) {
    //             if (this.object.targetCombatant !== null) {
    //                 if (this.object.targetCombatant.actor.type === 'npc' || this.object.targetCombatant.actor.system.battlegroup) {
    //                     dice += Math.floor(dice / 4);
    //                     baseDamage = dice;
    //                 }
    //             }
    //         }
    //     }
    //     else if (this._damageRollType('withering')) {
    //         dice -= this.object.soak;
    //         if (dice < this.object.overwhelming) {
    //             dice = Math.max(dice, this.object.overwhelming);
    //         }
    //         if (dice < 0) {
    //             dice = 0;
    //         }
    //         dice += this.object.damage.postSoakDamage;
    //     }

    //     let rerollString = '';
    //     let rerolls = [];

    //     for (var rerollValue in this.object.damage.reroll) {
    //         if (this.object.damage.reroll[rerollValue].status) {
    //             rerollString += `x${this.object.damage.reroll[rerollValue].number}`;
    //             rerolls.push(this.object.damage.reroll[rerollValue].number);
    //         }
    //     }

    //     let roll = new Roll(`${dice}d10${rerollString}cs>=${this.object.damage.difficulty}`).evaluate({ async: false });
    //     let diceRoll = roll.dice[0].results;
    //     let getDice = "";
    //     let soakResult = ``;
    //     let bonus = 0;
    //     this.object.finalDamageDice = dice;

    //     for (let dice of diceRoll) {
    //         if (dice.result >= this.object.damage.doubleSuccess) {
    //             bonus++;
    //             getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
    //         }
    //         else if (dice.result >= this.object.damage.difficulty) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
    //         else if (dice.result == 1) { 
    //             if (!this.object.casteRoll){bonus--;}
    //             getDice += `<li class="roll die d10 failure">${dice.result}</li>`; 
    //         }
    //         else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
    //     }

    //     let total = roll.total;
    //     total += bonus;
    //     total += this.object.damage.damageSuccessModifier;
    //     var characterDamage = total;

    //     let typeSpecificResults = ``;

    //     if (this._damageRollType('decisive')) {
    //         typeSpecificResults = `<h4 class="dice-total">${total} ${this.object.damage.type.capitalize()} Damage!</h4>`;
    //         this.object.characterInitiative = 3;
    //         if (this._useLegendarySize('decisive')) {
    //             typeSpecificResults = typeSpecificResults + `<h4 class="dice-formula">Legendary Size</h4><h4 class="dice-formula">Damage capped at ${3 + this.actor.system.attributes.strength.value} + Charm damage levels</h4>`;
    //             characterDamage = Math.min(characterDamage, 3 + this.actor.system.attributes.strength.value);
    //         }
    //         this.dealHealthDamage(characterDamage);
    //     }
    //     else if (this.object.rollType === 'gambit') {
    //         if (this.object.characterInitiative > 0 && (this.object.characterInitiative - this.object.gambitDifficulty - 1 <= 0)) {
    //             this.object.characterInitiative -= 5;
    //         }
    //         this.object.characterInitiative = this.object.characterInitiative - this.object.gambitDifficulty - 1;
    //         var resultsText = `<h4 class="dice-total">Gambit Success</h4>`;
    //         if (this.object.gambitDifficulty > total) {
    //             resultsText = `<h4 class="dice-total">Gambit Failed</h4>`
    //         }
    //         typeSpecificResults = `<h4 class="dice-formula">${total} Successes vs ${this.object.gambitDifficulty} Difficulty!</h4>${resultsText}`;
    //     }
    //     else {
    //         let targetResults = ``;
    //         if (this.object.target && game.combat) {
    //             if (this.object.targetCombatant && this.object.targetCombatant.initiative !== null) {
    //                 this.object.characterInitiative++;
    //                 if (this.object.targetCombatant.actor.type !== 'npc' || this.object.targetCombatant.actor.system.battlegroup === false) {
    //                     let newInitative = this.object.targetCombatant.initiative;
    //                     newInitative -= total;
    //                     this.object.characterInitiative += total;
    //                     if ((newInitative <= 0 && this.object.targetCombatant.initiative > 0)) {
    //                         if (this._useLegendarySize('withering')) {
    //                             newInitative = 1;
    //                         }
    //                         else {
    //                             this.object.crashed = true;
    //                             this.object.characterInitiative += 5;
    //                             targetResults = `<h4 class="dice-total">Target Crashed!</h4>`;
    //                         }
    //                     }
    //                     game.combat.setInitiative(this.object.targetCombatant.id, newInitative);
    //                 }
    //                 else if (this.object.targetCombatant.actor.system.battlegroup) {
    //                     var sizeDamaged = this.dealHealthDamage(total, true);
    //                     if (sizeDamaged) {
    //                         targetResults = `<h4 class="dice-total">Magnitude Filled!</h4>`;
    //                         this.object.characterInitiative += 5;
    //                     }
    //                 }
    //             }
    //         }
    //         soakResult = `<h4 class="dice-formula">${this.object.soak} Soak!</h4><h4 class="dice-formula">${this.object.overwhelming} Overwhelming!</h4>`;
    //         typeSpecificResults = `
    //                                 <h4 class="dice-formula">${total} Damage!</h4>
    //                                 <h4 class="dice-total">${total} Total Damage!</h4>
    //                                 ${targetResults}
    //                                 `;

    //     }
    //     damageResults = `
    //                             <h4 class="dice-total">${this.object.rollType === 'gambit' ? 'Gambit' : 'Damage'}</h4>
    //                             <h4 class="dice-formula">${baseDamage} Dice + ${this.object.damage.damageSuccessModifier} successes</h4>
    //                             ${soakResult}
    //                             <div class="dice-tooltip">
    //                                                 <div class="dice">
    //                                                     <ol class="dice-rolls">${getDice}</ol>
    //                                                 </div>
    //                                             </div>${typeSpecificResults}`;

    //     var title = "Decisive Attack";
    //     if (this.object.rollType === 'withering') {
    //         title = "Withering Attack";
    //     }
    //     if (this.object.rollType === 'gambit') {
    //         title = "Gambit";
    //     }
    //     var messageContent = '';
    //     if (this.object.rollType === 'damage') {
    //         messageContent = `
    //         <div class="chat-card">
    //             <div class="card-content">Damage Roll</div>
    //             <div class="card-buttons">
    //                 <div class="flexrow 1">
    //                     <div>
    //                         <div class="dice-roll">
    //                             <div class="dice-result">
    //                                 ${damageResults}
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //       `;
    //     }
    //     else {
    //         messageContent = `
    //         <div class="chat-card">
    //             <div class="card-content">${title}</div>
    //             <div class="card-buttons">
    //                 <div class="flexrow 1">
    //                     <div>
    //                         <div class="dice-roll">
    //                             <div class="dice-result">
    //                                 <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
    //                                 <div class="dice-tooltip">
    //                                     <div class="dice">
    //                                         <ol class="dice-rolls">${this.object.getDice}</ol>
    //                                     </div>
    //                                 </div>
    //                                 <h4 class="dice-formula">${this.object.total} Successes vs ${this.object.defense} Defense</h4>
    //                                 ${damageResults}
    //                             </div>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //       `;
    //     }

    //     ChatMessage.create({
    //         user: game.user.id,
    //         speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //         content: messageContent,
    //         type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    //         roll: this.object.roll || roll,
    //         flags: {
    //             "exalteddemake": {
    //                 dice: this.object.dice,
    //                 successModifier: this.object.successModifier,
    //                 total: this.object.total,
    //                 defense: this.object.defense,
    //                 threshholdSuccesses: this.object.thereshholdSuccesses,
    //                 damage: {
    //                     dice: baseDamage,
    //                     successModifier: this.object.damage.damageSuccessModifier,
    //                     soak: this.object.soak,
    //                     totalDamage: total,
    //                     crashed: this.object.crashed
    //                 }
    //             }
    //         }
    //     });

    //     if (this.actor.type !== 'npc' || this.actor.system.battlegroup === false) {
    //         let combat = game.combat;
    //         if (this.object.target && combat) {
    //             let combatant = combat.combatants.find(c => c.actorId == this.actor.id);
    //             if (combatant && combatant.initiative != null) {
    //                 combat.setInitiative(combatant.id, this.object.characterInitiative);
    //             }
    //         }
    //     }
    //     else if (this.actor.system.battlegroup) {
    //         let combat = game.combat;
    //         if (this.object.target) {
    //             let combatant = combat.combatants.find(c => c.actorId == this.object.target.actor.id);
    //             if (combatant && combatant.initiative != null && combatant.initiative <= 0) {
    //                 this.dealHealthDamage(total);
    //             }
    //         }
    //     }
    //     this._addOnslaught();
    // }

    // async _addOnslaught() {
    //     if (this.object.target && game.settings.get("exalteddemake", "calculateOnslaught")) {
    //         if (!this._useLegendarySize('onslaught')) {
    //             const onslaught = this.object.target.actor.effects.find(i => i.label == "Onslaught");
    //             if (onslaught) {
    //                 let changes = duplicate(onslaught.changes);
    //                 if (this.object.target.actor.system.dodge.value > 0) {
    //                     changes[0].value = changes[0].value - 1;
    //                 }
    //                 if (this.object.target.actor.system.parry.value > 0) {
    //                     changes[1].value = changes[1].value - 1;
    //                 }
    //                 onslaught.update({ changes });
    //             }
    //             else {
    //                 this.object.target.actor.createEmbeddedDocuments('ActiveEffect', [{
    //                     label: 'Onslaught',
    //                     icon: 'systems/exalteddemake/assets/icons/surrounded-shield.svg',
    //                     origin: this.object.target.actor.uuid,
    //                     disabled: false,
    //                     "changes": [
    //                         {
    //                             "key": "data.dodge.value",
    //                             "value": -1,
    //                             "mode": 2
    //                         },
    //                         {
    //                             "key": "data.parry.value",
    //                             "value": -1,
    //                             "mode": 2
    //                         }
    //                     ]
    //                 }]);
    //             }
    //         }
    //     }
    // }

    dealHealthDamage(characterDamage, targetBattlegroup = false) {
        if (this.object.target && game.combat && game.settings.get("exalteddemake", "autoDecisiveDamage") && characterDamage > 0) {
            let totalHealth = 0;
            const targetActorData = duplicate(this.object.target.actor);
            for (let [key, health_level] of Object.entries(targetActorData.system.health.levels)) {
                totalHealth += health_level.value;
            }
            if (this.object.damage.type === 'bashing') {
                targetActorData.system.health.bashing = Math.min(totalHealth - targetActorData.system.health.aggravated - targetActorData.system.health.lethal, targetActorData.system.health.bashing + characterDamage);
            }
            if (this.object.damage.type === 'lethal') {
                targetActorData.system.health.lethal = Math.min(totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.aggravated, targetActorData.system.health.lethal + characterDamage);
            }
            if (this.object.damage.type === 'aggravated') {
                targetActorData.system.health.aggravated = Math.min(totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.lethal, targetActorData.system.health.aggravated + characterDamage);
            }
            this.object.target.actor.update(targetActorData);
            if (this._damageRollType('withering') && targetBattlegroup && (totalHealth - targetActorData.system.health.bashing - targetActorData.system.health.lethal - targetActorData.system.health.aggravated) <= 0) {
                return true;
            }
        }
        return false;
    }

    async _completeCraftProject() {
        this._baseAbilityDieRoll();
        let resultString = ``;
        let projectStatus = ``;
        let craftFailed = false;
        let craftSuccess = false;
        let goalNumberLeft = this.object.goalNumber;
        let extendedTest = ``;
        const threshholdSuccesses = this.object.total - this.object.difficulty;
        if (this.object.goalNumber > 0) {
            extendedTest = `<h4 class="dice-total">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
        }
        if (this.object.total < this.object.difficulty) {
            resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Check Failed</h4>${extendedTest}`;
            if (this.object.intervals === 1) {
                craftFailed = true;
            }
            for (let dice of this.object.roll.dice[0].results) {
                if (dice.result === 1 && this.object.total === 0) {
                    this.object.finished = true;
                    resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">Botch</h4>`;
                    craftFailed = true;
                }
            }
        }
        else {
            if (this.object.goalNumber > 0) {
                goalNumberLeft = Math.max(this.object.goalNumber - threshholdSuccesses - 1, 0);
                extendedTest = `<h4 class="dice-total">Goal Number: ${this.object.goalNumber}</h4><h4 class="dice-total">Goal Number Left: ${goalNumberLeft}</h4>`;
                if (goalNumberLeft > 0 && this.object.intervals === 1) {
                    craftFailed = true;
                }
                else if (goalNumberLeft === 0) {
                    craftSuccess = true;
                }
            }
            else {
                craftSuccess = true;
            }
            resultString = `<h4 class="dice-total">Difficulty: ${this.object.difficulty}</h4><h4 class="dice-total">${threshholdSuccesses} Threshhold Successes</h4>${extendedTest}`;
        }
        if (this.object.rollType === 'craft') {
            if (craftFailed) {
                projectStatus = `<h4 class="dice-total">Craft Project Failed</h4>`;
            }
            if (craftSuccess) {
                const actorData = duplicate(this.actor);
                var silverXPGained = 0;
                var goldXPGained = 0;
                var whiteXPGained = 0;
                if (this.object.craftType === 'basic') {
                    if (threshholdSuccesses >= 3) {
                        silverXPGained = 3 * this.object.objectivesCompleted;
                    }
                    else {
                        silverXPGained = 2 * this.object.objectivesCompleted;
                    }
                    projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained</h4>`;
                }
                else if (this.object.craftType === "major") {
                    if (threshholdSuccesses >= 3) {
                        silverXPGained = this.object.objectivesCompleted;
                        goldXPGained = 3 * this.object.objectivesCompleted;
                    }
                    else {
                        silverXPGained = this.object.objectivesCompleted;
                        goldXPGained = 2 * this.object.objectivesCompleted;
                    }
                    projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${silverXPGained} Silver XP Gained</h4><h4 class="dice-total">${goldXPGained} Gold XP Gained</h4>`;
                }
                else if (this.object.craftType === "superior") {
                    if (this.object.objectivesCompleted > 0) {
                        whiteXPGained = (this.object.craftRating - 1) + this.object.craftRating;
                        goldXPGained = (this.object.craftRating * 2) * this.object.intervals;
                    }
                    projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${goldXPGained} Gold XP Gained</h4><h4 class="dice-total">${whiteXPGained} White XP Gained</h4>`;
                }
                else if (this.object.craftType === "legendary") {
                    if (this.object.objectivesCompleted > 0) {
                        whiteXPGained = 10;
                    }
                    projectStatus = `<h4 class="dice-total">Craft Project Success</h4><h4 class="dice-total">${whiteXPGained} White XP Gained</h4>`;
                }
                else {
                    projectStatus = `<h4 class="dice-total">Craft Project Success</h4>`;
                }
                actorData.system.craft.experience.silver.value += silverXPGained;
                actorData.system.craft.experience.gold.value += goldXPGained;
                actorData.system.craft.experience.white.value += whiteXPGained;
                this.actor.update(actorData);
            }
        }
        if (this.object.rollType === 'working') {
            if (craftFailed) {
                projectStatus = `<h4 class="dice-total">Working Failed</h4>`;
            }
            if (craftSuccess) {
                projectStatus = `<h4 class="dice-total">Working Success</h4>`;
            }
        }


        let messageContent = `
<div class="chat-card">
    <div class="card-content">Dice Roll</div>
    <div class="card-buttons">
        <div class="flexrow 1">
            <div>Dice Roller - Number of Successes<div class="dice-roll">
                    <div class="dice-result">
                        <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                        <div class="dice-tooltip">
                            <div class="dice">
                                <ol class="dice-rolls">${this.object.getDice}</ol>
                            </div>
                        </div>
                        <h4 class="dice-total">${this.object.total} Successes</h4>
                        ${resultString}
                        ${projectStatus}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`
        ChatMessage.create({
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: messageContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: this.object.roll,
            flags: {
                "exalteddemake": {
                    dice: this.object.dice,
                    successModifier: this.object.successModifier,
                    total: this.object.total
                }
            }
        });
        this.object.goalNumber = goalNumberLeft;
        this.object.intervals--;
        if (this.object.intervals > 0) {
            this.render();
        }
    }

    _damageRollType(rollType) {
        return this.object.rollType === rollType || (this.object.rollType === 'damage' && this.object.attackType === rollType);
    }

    _getRangedAccuracy() {
        var ranges = {
            "bolt-close": 1,
            "bolt-medium": -1,
            "bolt-long": -4,
            "bolt-extreme": -6,

            "ranged-close": -6,
            "ranged-medium": -2,
            "ranged-long": -4,
            "ranged-extreme": -6,

            "thrown-close": 1,
            "thrown-medium": -1,
            "thrown-long": -4,
            "thrown-extreme": -6,

            "siege-close": -2,
            "siege-medium": 7,
            "siege-long": 5,
            "siege-extreme": 3,
        };

        var key = `${this.object.weaponType}-${this.object.range}`;
        var accuracyModifier = ranges[key];
        return accuracyModifier;
    }

    _useLegendarySize(effectType) {
        if (this.object.target) {
            if (effectType === 'onslaught') {
                return (this.object.target.actor.system.legendarysize && this.object.target.actor.system.warstrider.equipped) && !this.object.isMagic && !this.actor.system.legendarysize && !this.actor.system.warstrider.equipped;
            }
            if (effectType === 'withering') {
                return (this.object.target.actor.system.legendarysize || this.object.target.actor.system.warstrider.equipped) && !this.actor.system.legendarysize && !this.actor.system.warstrider.equipped && this.object.finalDamageDice < 10;
            }
            if (effectType === 'decisive') {
                return (this.object.target.actor.system.legendarysize || this.object.target.actor.system.warstrider.equipped) && !this.actor.system.legendarysize && !this.actor.system.warstrider.equipped;
            }
        }
        return false;
    }

    _getDiceCap() {
        var animaBonus = {
            Dim: 0,
            Glowing: 1,
            Burning: 2,
            Bonfire: 3,
            Transcendent: 4
        }
        if (this.object.rollType !== "base") {
            if (this.actor.type === "character") {
                if (this.actor.system.details.exalt === "solar" || this.actor.system.details.exalt === "abyssal") {
                    return this.actor.system.abilities[this.object.ability].value + this.actor.system.attributes[this.object.attribute].value;
                }
                if (this.actor.system.details.exalt === "dragonblooded") {
                    return this.actor.system.abilities[this.object.ability].value;
                }
                if (this.actor.system.details.exalt === "lunar") {
                    return `${this.actor.system.attributes[this.object.attribute].value} - ${this.actor.system.attributes[this.object.attribute].value + 5}`;
                }
                if (this.actor.system.details.exalt === "dreamsouled") {
                    return `${this.actor.system.abilities[this.object.ability].value} or ${Math.min(10, this.actor.system.abilities[this.object.ability].value + this.actor.system.essence.value)} when upholding ideal`;
                }
                if (this.actor.system.details.exalt === "umbral") {
                    return `${Math.min(10, this.actor.system.abilities[this.object.ability].value + this.actor.system.details.penumbra.value)}`;
                }
                if (this.actor.system.details.caste.toLowerCase() === "architect") {
                    return `${this.actor.system.attributes[this.object.attribute].value} or ${this.actor.system.attributes[this.object.attribute].value + this.actor.system.essence.value} in cities`;
                }
                if (this.actor.system.details.caste.toLowerCase() === "janest" || this.actor.system.details.caste.toLowerCase() === 'strawmaiden') {
                    return `${this.actor.system.attributes[this.object.attribute].value} + [Relevant of Athletics, Awareness, Presence, Resistance, or Survival]`;
                }
                if (this.actor.system.details.caste.toLowerCase() === "sovereign") {
                    return Math.min(Math.max(this.actor.system.essence.value, 3) + animaBonus[this.actor.system.anima.level], 10);
                }
            }
            else if (this.actor.system.creaturetype === 'exalt') {
                var dicePool = this.actor.system.pools[this.object.pool].value;
                var diceTier = "zero";
                var diceMap = {
                    'zero': 0,
                    'two': 2,
                    'three': 3,
                    'seven': 7,
                    'eleven': 11,
                };
                if (dicePool <= 2) {
                    diceTier = "two";
                }
                else if (dicePool <= 6) {
                    diceTier = "three";
                }
                else if (dicePool <= 10) {
                    diceTier = "seven";
                }
                else {
                    diceTier = "eleven";
                }
                if (this.actor.system.details.exalt === "solar" || this.actor.system.details.exalt === "abyssal") {
                    diceMap = {
                        'zero': 0,
                        'two': 2,
                        'three': 5,
                        'seven': 7,
                        'eleven': 10,
                    };
                }
                if (this.actor.system.details.exalt === "dragonblooded") {
                    diceMap = {
                        'zero': 0,
                        'two': 0,
                        'three': 2,
                        'seven': 4,
                        'eleven': 6,
                    };
                }
                if (this.actor.system.details.exalt === "lunar") {
                    diceMap = {
                        'zero': 0,
                        'two': 1,
                        'three': 2,
                        'seven': 4,
                        'eleven': 5,
                    };
                    if (diceTier === 'two') {
                        return 1;
                    }
                    return `${diceMap[diceTier]}, ${diceTier === 'seven' ? (diceMap[diceTier] * 2) - 1 : diceMap[diceTier] * 2}`;
                }
                if (this.actor.system.details.exalt === "liminal") {
                    diceMap = {
                        'zero': 0,
                        'two': 1,
                        'three': 2,
                        'seven': 4,
                        'eleven': 5,
                    };
                }
                return diceMap[diceTier];
            }
        }
        return "";
    }

    _getHighestAttribute() {
        var highestAttributeNumber = 0;
        var highestAttribute = "strength";
        for (let [name, attribute] of Object.entries(this.actor.system.attributes)) {
            if (attribute.value > highestAttributeNumber) {
                highestAttributeNumber = attribute.value;
                highestAttribute = name;
            }
        }
        return highestAttribute;
    }

    _spendMotes() {
        const actorData = duplicate(this.actor);
        var newLevel = actorData.system.anima.level;
        var newValue = actorData.system.anima.value;
        if (this.object.cost.anima > 0) {
            for (var i = 0; i < this.object.cost.anima; i++) {
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
        }
        var spentPersonal = 0;
        var spentPeripheral = 0;
        var totalMotes = this.object.cost.motes + this.object.cost.muteMotes;
        if (actorData.system.settings.charmmotepool === 'personal') {
            var remainingPersonal = actorData.system.motes.personal.value - totalMotes;
            if (remainingPersonal < 0) {
                spentPersonal = totalMotes + remainingPersonal;
                spentPeripheral = Math.min(actorData.system.motes.peripheral.value, Math.abs(remainingPersonal));
            }
            else {
                spentPersonal = totalMotes;
            }
        }
        else {
            var remainingPeripheral = actorData.system.motes.peripheral.value - totalMotes;
            if (remainingPeripheral < 0) {
                spentPeripheral = totalMotes + remainingPeripheral;
                spentPersonal = Math.min(actorData.system.motes.personal.value, Math.abs(remainingPeripheral));
            }
            else {
                spentPeripheral = totalMotes;
            }
        }
        actorData.system.motes.peripheral.value = Math.max(0 + actorData.system.motes.peripheral.committed, actorData.system.motes.peripheral.value - spentPeripheral);
        actorData.system.motes.personal.value = Math.max(0 + actorData.system.motes.personal.committed, actorData.system.motes.personal.value - spentPersonal);

        if ((spentPeripheral - this.object.cost.muteMotes) > 4) {
            for (var i = 0; i < Math.floor((spentPeripheral - this.object.cost.muteMotes) / 5); i++) {
                if (newLevel === "Dim") {
                    newLevel = "Glowing";
                    newValue = 1;
                }
                else if (newLevel === "Glowing") {
                    newLevel = "Burning";
                    newValue = 2;
                }
                else if (newLevel === "Burning") {
                    newLevel = "Bonfire";
                    newValue = 3;
                }
                else if (actorData.system.anima.max === 4) {
                    newLevel = "Transcendent";
                    newValue = 4;
                }
            }
        }

        actorData.system.anima.level = newLevel;
        actorData.system.willpower.value = Math.max(0, actorData.system.willpower.value - this.object.cost.willpower);
        if (this.object.cost.initiative > 0) {
            let combat = game.combat;
            if (combat) {
                let combatant = combat.combatants.find(c => c.actorId == this.actor.id);
                if (combatant) {
                    var newInitiative = combatant.initiative - this.object.cost.initiative;
                    if (combatant.initiative > 0 && newInitiative <= 0) {
                        newInitiative -= 5;
                    }
                    combat.setInitiative(combatant.id, newInitiative);
                }
            }
        }
        if (this.actor.type === 'character') {
            actorData.system.craft.experience.silver.value = Math.max(0, actorData.system.craft.experience.silver.value - this.object.cost.silverxp);
            actorData.system.craft.experience.gold.value = Math.max(0, actorData.system.craft.experience.gold.value - this.object.cost.goldxp);
            actorData.system.craft.experience.white.value = Math.max(0, actorData.system.craft.experience.white.value - this.object.cost.whitexp);
        }
        if (actorData.system.details.aura === this.object.cost.aura || this.object.cost.aura === 'any') {
            actorData.system.details.aura = "none";
        }
        if (this.object.cost.initiative > 0) {
            let combat = game.combat;
            if (combat) {
                let combatant = combat.combatants.find(c => c.actorId == this.actor.id);
                if (combatant) {
                    var newInitiative = combatant.initiative - this.object.cost.initiative;
                    if (combatant.initiative > 0 && newInitiative <= 0) {
                        newInitiative -= 5;
                    }
                    combat.setInitiative(combatant.id, newInitiative);
                }
            }
        }
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
            totalHealth += health_level.value;
        }
        if (this.object.cost.healthbashing > 0) {
            actorData.system.health.bashing = Math.min(totalHealth - actorData.system.health.aggravated - actorData.system.health.lethal, actorData.system.health.bashing + this.object.cost.healthbashing);
        }
        if (this.object.cost.healthlethal > 0) {
            actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.aggravated, actorData.system.health.lethal + this.object.cost.healthlethal);
        }
        if (this.object.cost.healthaggravated > 0) {
            actorData.system.health.aggravated = Math.min(totalHealth - actorData.system.health.bashing - actorData.system.health.lethal, actorData.system.health.aggravated + this.object.cost.healthaggravated);
        }

        this.actor.update(actorData);
    }
}
