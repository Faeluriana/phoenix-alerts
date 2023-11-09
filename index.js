let Healers = [6, 7];

module.exports = function phoenix(mod) {
    mod.game.initialize(['me', 'party']);
    const config = require('./config.json');
    let enabled = config.enabled;
    let debug = config.debug;
    let everyone = config.everyone;
    let dungeonOnly = config.dungeon;
    let myID = null;
    let healer = null;

    mod.command.add('phoenix', (cmd) => {
        switch (cmd) {
            case "all":
                everyone = !everyone;
                mod.command.message('phoenix alerting when ' + (everyone ? 'anyone' : (healer ? 'else' : 'healer') + ' is resurrecting'));
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
        myID = mod.game.me.gameId;
        healer = Healers.includes(mod.game.me.class);
    });

    // On logout
    mod.game.on('leave_game', () => {
        myID = null;
        healer = null;
    });

    // S_CREATURE_LIFE -> Resurrection
    mod.hook('S_CREATURE_LIFE', 3, (event) => {
        if (debug) {
            mod.command.message('S_CREATURE_LIFE: ' + event.gameId + ' ' + event.alive);
            mod.command.message('resItem: ' + event.resItem + ' | resPassive: ' + event.resPassive);
        }

        // If the player is in your party, and they are not you
        if (mod.game.party.isMember(event.gameId) && !mod.game.me.is(event.gameId)) {
            if (!event.alive) {
                // Phoenix mount passive
                if (event.resPassive && canSendMessage(event.gameId)) {
                    if (debug) mod.command.message('Phoenix Resurrection');
                    sendFakeMessage(event.gameId, 'Phoenix Resurrection');
                }
            }
            else { // event.alive
                // Eren's key
                if (event.resItem && canSendMessage(event.gameId)) {
                    if (debug) mod.command.message('Using Eren\'s Key');
                    sendFakeMessage(event.gameId, 'Using Eren\'s Key');
                }

            }
        }

    });

    const canSendMessage = (gameId) => {
        let targetRole = mod.game.party.getMemberData(gameId).class;

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

        if (debug) {
            mod.command.message('sendFakeMessage from ' + pname + ': ' + message);
            //return;
        }
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