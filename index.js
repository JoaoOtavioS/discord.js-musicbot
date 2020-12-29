// developed by JoaoOtavioS.
// Version: 1.0 - last update: 29/12/2020
const discord = require('discord.js'), credenciais = require('./database/credentials.json'), config = require('./database/config.json'), color = require("tynt"), fs = require('fs'), moment = require('moment')
const client = new discord.Client({ messageCacheMaxSize: 200, messageCacheLifetime: 604800, messageSweepInterval: 604800, disableEveryone: true });

if (!fs.existsSync('./languages/language_' + config.language + '.json')) { console.log(color.Red("\nLanguage config's is wrong, bot has been stopped.\n")), client.destroy(); return; } else { console.log(color.Green("Language config's correctly.\n")) }
var lang = require('./languages/language_' + config.language + '.json'), error = lang.error_notfound;
moment().format(), moment.locale(config["moment-lang"])

// Limitations:
// Support only guild. (to prevent errors)
client.on('ready', () => {
    if (client.guilds.cache.size > 1) return [console.log(color.Red(lang.error_oneguild)), client.destroy()]
    console.log(color.Green("\n" + lang.starting_completely) + "\n" + color.Red(" [" + error + "]\n"))
})

require('./moduleloader.js')(client, discord, config, credenciais, lang, color, fs)
client.commands = new discord.Collection(), client.aliases = new discord.Collection()
client.login(credenciais.token)