# Phoenix Alerts
- Alerts you with a fake party message when a party member is resurrecting with a Phoenix passive or with an Eren's Key
- Only you will be able to see this message
- If your class is not a healer, it only alerts you when the healer is resurrecting with phoenix/key
- If your class is a healer, it alerts you for everyone
- As a healer, it also warns you when someone got ressurected but isn't getting up yet. It could potentially impact performance(?)

## Configuration
- `enabled`: `true` if you want the mod enabled on startup. `false` otherwise
- `everyone`: `true` if you want the mod to alert you about everyone, regardless of your class
- - Only meaningful when you are not a Healer
- `debug`: `true` if you want debug messages
- `dungeon`: `true` if you only want it to work when you're inside a dungeon
- `ress_confirmation`: `true` if you want to be warned about sucessful resurrection casts
- - Setting it to `false` turns this feature off, and removes the potential performance issues
- `language`: `en` for English language. Currently the only one supported

## Dependencies
- This mod was made for **[Tera Private Toolbox](https://github.com/tera-private-toolbox/tera-toolbox)** - I cannot make any guarantees that it will work on any other toolbox
- **[Command](https://github.com/tera-private-toolbox/command)** - Already installed in toolbox
- **[Tera-Game-State](https://github.com/tera-private-toolbox/tera-game-state)**

## Translations
- If you wish to help translate to your language i'd appreciate it! It's only a few words so it should be very easy

## Special Thanks
- to Chiral for helping with the testing