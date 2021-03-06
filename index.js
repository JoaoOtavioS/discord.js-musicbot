// developed by JoaoOtavioS.
// Version: 1.0 - last update: 29/12/2020
const discord = require('discord.js'), credenciais = require('./database/credentials.json'), config = require('./database/config.json'), fs = require('fs');
const client = new discord.Client({ messageCacheMaxSize: 200, messageCacheLifetime: 604800, messageSweepInterval: 604800, disableEveryone: true });

// Limitations:
// Support only guild. (to prevent errors)
client.on('ready', () => {
    console.log("Bot ON")
})

require('./moduleloader.js')(client, discord, config, credenciais, fs)
client.commands = new discord.Collection(), client.aliases = new discord.Collection()
client.login(credenciais.token)
