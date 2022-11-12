export function registerSettings() {
    game.settings.register('exalteddemake', 'calculateOnslaught', {
        name: game.i18n.localize('ExD.Onslaught'),
        hint: game.i18n.localize('ExD.ShowOnslaughtDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exalteddemake', 'defenseOnDamage', {
        name: game.i18n.localize('ExD.DefenseOnDamage'),
        hint: game.i18n.localize('ExD.DefenseOnDamageDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exalteddemake', 'autoDecisiveDamage', {
        name: game.i18n.localize('ExD.AutoDecisiveDamage'),
        hint: game.i18n.localize('ExD.AutoDecisiveDamageDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });
}