module.exports = (client, discord, config, credenciais) => {

    fs.readdir("./modules/", (err, files) => {
        if (err) console.error(err)
        let jsfiles = files.filter(f => f.split(".").pop() === "js");
        if (jsfiles.length <= 0) return
        jsfiles.forEach((f) => {
            let moduleinfo = require(`./modules/${f}`)
            if (moduleinfo.info.moduleactive == true) {
                require('./modules/' + f.replace('.js', ''))(client, discord, config, credenciais)
            }
        })
    })

}

module.exports.info = {
    modulename: 'Module Loader'
};
