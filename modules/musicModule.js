var queue = new Map();
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

// (I didn't do it this function, sorry, I don't remember the author)
function format(seconds) { const format = val => `0${Math.floor(val)}`.slice(-2), hours = seconds / 3600, minutes = (seconds % 3600) / 60; return [hours, minutes, seconds % 60].map(format).join(':') }

const lang = {
    "listening": "Nenhuma música tocando no momento.",
    "no_vc": "Você não está em um canal de voz.",
    "no_vc_bot": "Você não está no mesmo canal de voz que o bot.",
    "noskip": "Como não há mais de 2 músicas na fila, a ação foi cancelada.",
    "radio_title": "Rádio - Nome",
    "music_queue": "Fila de música:",
    "music_playing": "Estou jogando agora",
    "music_details": "Informações da música atual:",
    "music_likeXdeslike": "Likes e deslikes:",
    "music_views": "Visualizações:",
    "music_duration": "Duração da música:",
    "music_author": "Autor:",
    "next_music": "Próxima música:",
    "information": "Informações:",
    "loop": "Repetir música:",
    "pause": "Música atual pausada:",
    "volume": "Volume da música:",
    "none": "Nenhuma"
}

module.exports = (client, discord, config, credenciais, fs) => {

    var pause = false, loop = false, messageid = null, listening = lang.listening;

    // Define the channel the bot will use for the music system
    const settings = {
        channel: "música",
        djrole: '799109650502254633',
        activity: false,
        time: 999999999
    }

    client.on('ready', async () => {

        // Activity "listening" a music
        if (settings.activity == true) {
            setInterval(() => { client.user.setActivity(listening, { type: "LISTENING" }) }, 5000);
        }

        client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).send(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.listening}`)).then(async msg => {
            await msg.react("⏹️"); await msg.react("⏯️"); await msg.react("⏭️"); await msg.react("🔄");
            messageid = msg.id;

            msg.createReactionCollector((r, u) => r.emoji.name === "⏹️", { time: settings.time }).on("collect", async (r, user) => {
                msg.reactions.resolve("⏹️").users.remove(user.id);
                if (!queue.get(msg.guild.id) || !msg.guild.members.cache.get(user.id).roles.cache.has(settings.djrole)) return;
                update(msg.guild.id, false)
                queue.get(msg.guild.id).voiceChannel.leave(); queue.delete(msg.guild.id);
                listening = lang.listening
            })

            msg.createReactionCollector((r, u) => r.emoji.name === "⏯️", { time: settings.time }).on("collect", async (r, user) => {
                msg.reactions.resolve("⏯️").users.remove(user.id);
                if (!queue.get(msg.guild.id) || !msg.guild.members.cache.get(user.id).roles.cache.has(settings.djrole)) return;
                if (pause == false) {
                    pause = true;
                    queue.get(msg.guild.id).connection.dispatcher.pause(true);
                } else {
                    pause = false;
                    queue.get(msg.guild.id).connection.dispatcher.resume();
                }
                update(msg.guild.id, true)
            })

            msg.createReactionCollector((r, u) => r.emoji.name === "⏭️", { time: settings.time }).on("collect", async (r, user) => {
                msg.reactions.resolve("⏭️").users.remove(user.id);
                if (!queue.get(msg.guild.id) || !msg.guild.members.cache.get(user.id).roles.cache.has(settings.djrole)) return;
                if (queue.get(msg.guild.id).songs[1] == null) return msg.channel.send(new discord.MessageEmbed().setColor("#36393f").setDescription(`${lang.noskip}`)).then(a => { setTimeout(() => { a.delete(); }, 2500); })
                queue.get(msg.guild.id).songs.shift();
                playSong(msg.guild, queue.get(msg.guild.id).songs[0]);
            })

            msg.createReactionCollector((r, u) => r.emoji.name === "🔄", { time: settings.time }).on("collect", async (r, user) => {
                msg.reactions.resolve("🔄").users.remove(user.id);
                if (!queue.get(msg.guild.id) || !msg.guild.members.cache.get(user.id).roles.cache.has(settings.djrole)) return;
                if (loop == false) loop = true; else loop = false;
                update(msg.guild.id, true)
            })

        })
    })

    client.on('message', async (message) => {
        if (message.author.bot) return;
        const args = message.content.trim().split(/ +/g);

        if (message.channel.name == settings.channel) {
            message.delete().catch();

            var queue_ = queue.get(message.guild.id);
            let serverQueue = queue.get(message.guild.id), vc = message.member.voice.channel, url = message.content;

            // Verify voice channel
            if (!vc) return message.channel.send(lang.no_vc).then(a => { setTimeout(() => { a.delete(); }, 5000); })
            if (queue_ != undefined) {
                if (vc != queue_.voiceChannel) return message.channel.send(lang.no_vc_bot).then(a => { setTimeout(() => { a.delete(); }, 5000); })
            }

            // Volume and Queue command
            if (message.content.startsWith("volume")) {
                if (!queue_ || Number(args[1]) > 1000 || Number(args[1]) < 0 || isNaN(args[1]) || !message.member.roles.cache.has(settings.djrole)) return;
                queue_.volume = args[1]; queue_.connection.dispatcher.setVolumeLogarithmic(args[1] / 100);
                return update(message.guild.id, true)
            } else if (message.content.startsWith("lista") || message.content.startsWith("fila") || message.content.startsWith("queue")) {
                if (!queue_) return;
                return message.reply(new discord.MessageEmbed().setTitle(`**${lang.music_queue}**`).setColor("#36393f").setDescription(`` + (serverQueue.songs.map((track, i) => { return `**#${i + 1}** - ${track.title} | [(link)](${track.url})` }).slice(0, 10).join('\n')))).then(a => { setTimeout(() => { a.delete(); }, 5000); })
            }

            if (!url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)) {
                try {
                    const res = await ytsr(args.toString(), { limit: 1 });
                    url = res.items[0].url;
                } catch (error_sr) {
                    if (error_sr) return;
                }
            }

            let songinfo = await ytdl.getInfo(url);
            let song = {
                title: songinfo.videoDetails.title,
                url: songinfo.videoDetails.video_url,
                thumbnail: songinfo.videoDetails.thumbnails[0].url + '.png',
                author: songinfo.videoDetails.author.name,
                author_url: songinfo.videoDetails.author.channel_url,
                duration: format(songinfo.videoDetails.lengthSeconds),
                viewCount: songinfo.videoDetails.viewCount,
                likes: songinfo.videoDetails.likes,
                dislikes: songinfo.videoDetails.dislikes
            }

            if (!serverQueue) {
                let queueConst = {
                    textChannel: message.channel,
                    voiceChannel: vc,
                    connection: null,
                    songs: [],
                    volume: 100,
                    playing: true
                };
                queue.set(message.guild.id, queueConst);
                queueConst.songs.push(song);
                try {
                    let connection = await vc.join();
                    queueConst.connection = connection;
                    playSong(message.guild, queueConst.songs[0]);
                } catch (error) {
                    queue.delete(message.guild.id);
                    if (error) return;
                }
            } else {
                serverQueue.songs.push(song);
                return update(message.guild.id, true)
            }
        }
    });

    async function update(guild, all) {
        if (all == true) {
            client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`
                \n${lang.music_playing} **${queue.get(guild).songs[0].title}**.\n
                ${lang.music_details}
                ${lang.music_author} [${queue.get(guild).songs[0].author}](${queue.get(guild).songs[0].author_url})
                ${lang.music_likeXdeslike} ${queue.get(guild).songs[0].likes}/${queue.get(guild).songs[0].dislikes}
                ${lang.music_views} ${queue.get(guild).songs[0].viewCount}
                ${lang.music_duration} ${queue.get(guild).songs[0].duration}\n
                ${lang.information}
                ${lang.next_music} ${queue.get(guild).songs[1] == null ? `**${lang.none}**` : `**${queue.get(guild).songs[1].title}**`}
                ${lang.loop} ${loop == false ? "**Desativado**" : "**Ativado**"}
                ${lang.pause} ${pause == false ? "**Não**" : "**Sim**"}
                ${lang.volume} **${queue.get(guild).volume}%**`
            ).setThumbnail(queue.get(guild).songs[0].thumbnail))
        } else if (all == false) {
            client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.listening}`));
        }
    }

    async function playSong(guild, song) {
        let serverQueue = queue.get(guild.id);

        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            update(guild.id, false)
            listening = lang.listening
            return;
        }

        update(guild.id, true)
        listening = song.title;
        dispatcher = await serverQueue.connection.play(ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' }));

        dispatcher.on('finish', () => {
            if (loop == true) return playSong(guild, serverQueue.songs[0]);
            serverQueue.songs.shift();
            playSong(guild, serverQueue.songs[0]);
            if (pause == true) {
                pause = false;
                queue.get(msg.guild.id).connection.dispatcher.resume();
            }
        })
        dispatcher.on('error', () => { serverQueue.songs.shift(); playSong(guild, serverQueue.songs[0]); });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    }
}

module.exports.info = {
    name: "musicSystem",
    description: "O modulo de musica.",
    active: true,
    version: "0.0.2"
}
