const Healers = [6, 7];

module.exports = function phoenix(mod) {
    mod.game.initialize(['me', 'party']);
    const config = require('./config.json');
    let enabled = config.enabled;
    let debug = config.debug;
    let everyone = config.everyone;
    let dungeonOnly = config.dungeon;
    let healer = null;
    let ress_confirmation = config.ress_Confirmation;
    const lang = config.language;
    const msgs = config.availableLanguages[lang];


    mod.command.add('phoenix', (cmd) => {
        switch (cmd) {
            case "all":
                everyone = !everyone;
                mod.command.message('phoenix alerts when ' + (everyone ? 'anyone' : (healer ? '' : 'a healer')) + ' is resurrecting');
                break;
            case "debug":
                debug = !debug;
                mod.command.message('phoenix ' + (debug ? 'debugging' : 'not debugging'));
                break;
            default:
                enabled = !enabled;
                mod.command.message('phoenix alerts ' + (enabled ? 'enabled' : 'disabled'));
        }
    });

    // On login
    mod.game.on('enter_game', () => {
        const temp = mod.game.me.class;
        if (temp == "priest" || temp == "elementalist") {
            healer = true;
        }else {
            healer = false;
        }
    });

    // On logout
    mod.game.on('leave_game', () => {
        healer = null;
    });

    // S_CREATURE_LIFE -> Resurrection
    mod.hook('S_CREATURE_LIFE', 3, (event) => {
        if (debug) {
            const name = mod.game.party.getMemberData(event.gameId).name;
            mod.command.message('S_CREATURE_LIFE: ' + name + ' ' + (event.alive ? 'alive' : 'dead'));
            mod.command.message('Eren\'s Key: ' + event.resItem + ' | Phoenix: ' + event.resPassive);
        }

        // If the player is in your party, and they are not you
        if (mod.game.party.isMember(event.gameId) && !mod.game.me.is(event.gameId)) {
            if (!event.alive) {
                // Phoenix mount passive
                if (event.resPassive && canSendMessage(event.gameId)) {
                    sendFakeMessage(event.gameId, msgs[0]);
                }
            }
            else { // event.alive
                // Eren's key
                if (event.resItem && canSendMessage(event.gameId)) {
                    sendFakeMessage(event.gameId, msgs[1]);
                }
            }
        }
    });

    /* only in dungeons for performance reasons */
    if (ress_confirmation) {
        mod.hook('S_EACH_SKILL_RESULT', 14, (event) => {
            if (!enabled) return;
            if (!mod.game.me.inDungeon) return;

            if (debug) {
                const source = event.source;
                const target = event.target;
                const skillId = event.skill;
                const type = event.type; // 0 = hidden
                if (mod.game.party.isMember(source)) {
                    const name = mod.game.party.getMemberData(source).name;
                    mod.command.message('S_EACH_SKILL_RESULT: ' + name + ' ' + ' ' + skillId + ' ' + target + ' ' + type);
                }
            }

            if (mod.game.party.isMember(event.source) && Healers.includes(mod.game.party.getMemberData(event.source).class)) {
                let ressId = (mod.game.party.getMemberData(event.source).class == 6) ? 12 : 10; // Mystic 10, Priest 12
                // if event.skill starts with A+ressId then notify successfull ress (i.e. "A12")
                if (event.skill.toString().startsWith('A' + ressId) && canSendMessage(event.target)) {
                    sendFakeMessage(event.target, msgs[2]);
                }
            }
        });
    }

    /* Resurrection Scrolls probably need some Item related packet */

    const canSendMessage = (gameId) => {
        let targetRole = mod.game.party.getMemberData(gameId).class;

        if (debug) {
            const name = mod.game.party.getMemberData(gameId).name;
            mod.command.message('canSendMessage: ' + name + ' ' + targetRole);
        }
        if (!enabled) return false;
        if (dungeonOnly && !mod.game.me.inDungeon) {
            return false;
        }

        // Protect against unknown scenarios
        if (mod.game.me.inBattleground || mod.game.me.inCivilUnrest) return false;

        if (everyone || healer) return true;
        else if (!healer) { // If you are not a healer
            if (!Healers.includes(targetRole)) {
                return false; // and target is not a healer
            }
        }
        return true;
    };

    const sendFakeMessage = (gameId, message) => {
        let person = mod.game.party.getMemberData(gameId);
        let pname = person.name;

        mod.send('S_CHAT', 3, {
            channel: 1, // 1 = party
            gameId: gameId, // Might be useless
            playerId: person.playerId, //
            serverId: person.serverId, //
            isWorldEventTarget: false, //
            gm: false, //
            founder: false, //
            name: pname,
            message: message
        });
    }
};