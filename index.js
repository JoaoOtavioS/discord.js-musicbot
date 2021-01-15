// developed by JoaoOtavioS.
// Version: 1.0 - last update: 29/12/2020
const discord = require('discord.js'), credenciais = require('./database/credentials.json'), config = require('./database/config.json'), fs = require('fs');
const client = new discord.Client({ messageCacheMaxSize: 200, messageCacheLifetime: 604800, messageSweepInterval: 604800, disableEveryone: true });

// Limitations:
// Support only guild. (to prevent errors)
client.on('ready', () => {
    if (client.guilds.cache.size > 1) return [console.log(color.Red(lang.error_oneguild)), client.destroy()]
    console.log(color.Green("\n" + lang.starting_completely) + "\n" + color.Red(" [" + error + "]\n"))
})

require('./moduleloader.js')(client, discord, config, credenciais, fs)
client.commands = new discord.Collection(), client.aliases = new discord.Collection()
client.login(credenciais.token)
