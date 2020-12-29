module.exports = (client, discord, config, credenciais, lang, color, fs) => {

    console.log(color.Green(lang.starting_bot + " " + config.language + "\n")), console.log(color.Green(lang.starting_modules));
    fs.readdir("./modules/", (err, files) => {
        if (err) console.error(err)
        let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if (jsfiles.length <= 0) return
        jsfiles.forEach((f) => {
            let moduleinfo = require(`./modules/${f}`)
            if (moduleinfo.info.moduleactive == true) {
                require('./modules/' + f.replace('.js', ''))(client, discord, config, credenciais, lang, color)
                console.log(lang.module_starting.replace("<module>", moduleinfo.info.modulename))
            } else console.log(lang.module_nostarting.replace("<module>", moduleinfo.info.modulename))
        })
    })

}

module.exports.info = {
    modulename: 'Module Loader'
};