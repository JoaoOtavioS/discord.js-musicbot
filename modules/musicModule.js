var queue = new Map();
const ytdl = require('ytdl-core'), prefix = "!";

// (I didn't do it this function, sorry, I don't remember the author)
function format(seconds) { const format = val => `0${Math.floor(val)}`.slice(-2), hours = seconds / 3600, minutes = (seconds % 3600) / 60; return [hours, minutes, seconds % 60].map(format).join(':') }

module.exports = (client, discord, config, credenciais, lang, color) => {

    var pause = false, messageid = null, listening = lang.listening;

    // Define the channel the bot will use for the music system
    const settings = {
        channel: "música"
    }

    client.on('ready', async () => {
        setInterval(() => { client.user.setActivity(listening, { type: "LISTENING" }) }, 3000);
        client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel)
            .send(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.listening}`)).then(async msg => {
                await msg.react("⏹️"); await msg.react("⏯️"); await msg.react("⏭️")
                messageid = msg.id;

                const reactstop = msg.createReactionCollector((r, u) => r.emoji.name === "⏹️", { time: 999999999 })
                reactstop.on("collect", async r => {
                    data = JSON.parse(JSON.stringify(r));
                    if (!queue.get(msg.guild.id)) return msg.reactions.resolve("⏹️").users.remove(data.users[1]);
                    msg.edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.listening}`));
                    msg.reactions.resolve("⏹️").users.remove(data.users[1]);
                    queue.get(msg.guild.id).voiceChannel.leave();
                    queue.delete(msg.guild.id);
                    listening = lang.listening
                })

                const reactpause = msg.createReactionCollector((r, u) => r.emoji.name === "⏯️", { time: 999999999 })
                reactpause.on("collect", async r => {
                    data = JSON.parse(JSON.stringify(r));
                    if (!queue.get(msg.guild.id)) return msg.reactions.resolve("⏯️").users.remove(data.users[1]);

                    msg.reactions.resolve("⏯️").users.remove(data.users[1]);
                    if (pause == false) {
                        pause = true;
                        queue.get(msg.guild.id).connection.dispatcher.pause(true);
                        return client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.music_playing} **${queue.get(msg.guild.id).songs[0].title}**.\n\n${lang.music_details}\n${lang.music_author} [${queue.get(msg.guild.id).songs[0].author}](${queue.get(msg.guild.id).songs[0].author_url})\n${lang.music_likeXdeslike} ${queue.get(msg.guild.id).songs[0].likes}/${queue.get(msg.guild.id).songs[0].dislikes}\n${lang.music_views} ${queue.get(msg.guild.id).songs[0].viewCount}\n${lang.music_duration} ${queue.get(msg.guild.id).songs[0].duration}\n\n${queue.get(msg.guild.id).songs[1] == null ? `${lang.next_music} **${lang.none}**` : `${lang.next_music} **${queue.get(msg.guild.id).songs[1].title}**`}\n${pause == false ? `${lang.status_1} ${queue.get(msg.guild.id).volume}%**` : `${lang.status_2}  ${queue.get(msg.guild.id).volume}%**`}`))
                    } else {
                        pause = false;
                        queue.get(msg.guild.id).connection.dispatcher.resume();
                        return client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.music_playing} **${queue.get(msg.guild.id).songs[0].title}**.\n\n${lang.music_details}\n${lang.music_author} [${queue.get(msg.guild.id).songs[0].author}](${queue.get(msg.guild.id).songs[0].author_url})\n${lang.music_likeXdeslike} ${queue.get(msg.guild.id).songs[0].likes}/${queue.get(msg.guild.id).songs[0].dislikes}\n${lang.music_views} ${queue.get(msg.guild.id).songs[0].viewCount}\n${lang.music_duration} ${queue.get(msg.guild.id).songs[0].duration}\n\n${queue.get(msg.guild.id).songs[1] == null ? `${lang.next_music} **${lang.none}**` : `${lang.next_music} **${queue.get(msg.guild.id).songs[1].title}**`}\n${pause == false ? `${lang.status_1} ${queue.get(msg.guild.id).volume}%**` : `${lang.status_2}  ${queue.get(msg.guild.id).volume}%**`}`))
                    }
                })

                const reactskip = msg.createReactionCollector((r, u) => r.emoji.name === "⏭️", { time: 999999999 })
                reactskip.on("collect", async r => {
                    data = JSON.parse(JSON.stringify(r));
                    if (!queue.get(msg.guild.id)) return msg.reactions.resolve("⏭️").users.remove(data.users[1]);
                    msg.reactions.resolve("⏭️").users.remove(data.users[1]);
                    if (queue.get(msg.guild.id).songs[1] == null) return msg.channel.send(new discord.MessageEmbed().setColor("#36393f").setDescription(`${lang.noskip}`)).then(a => { setTimeout(() => { a.delete(); }, 1500); })
                    queue.get(msg.guild.id).songs.shift();
                    playSong(msg.guild, queue.get(msg.guild.id).songs[0]);
                    return client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.music_playing} **${queue.get(msg.guild.id).songs[0].title}**.\n\n${lang.music_details}\n${lang.music_author} [${queue.get(msg.guild.id).songs[0].author}](${queue.get(msg.guild.id).songs[0].author_url})\n${lang.music_likeXdeslike} ${queue.get(msg.guild.id).songs[0].likes}/${queue.get(msg.guild.id).songs[0].dislikes}\n${lang.music_views} ${queue.get(msg.guild.id).songs[0].viewCount}\n${lang.music_duration} ${queue.get(msg.guild.id).songs[0].duration}\n\n${queue.get(msg.guild.id).songs[1] == null ? `${lang.next_music} **${lang.none}**` : `${lang.next_music} **${queue.get(msg.guild.id).songs[1].title}**`}\n${pause == false ? `${lang.status_1} ${queue.get(msg.guild.id).volume}%**` : `${lang.status_2}  ${queue.get(msg.guild.id).volume}%**`}`))
                })
            })
    })

    client.on('message', async (message) => {
        if (message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);

        if (message.channel.name == "música") {
            message.delete().catch();
            var queue_ = queue.get(message.guild.id);
            let serverQueue = queue.get(message.guild.id), vc = message.member.voice, url = message.content;

            if (message.content.startsWith("volume")) {
                if (!queue_) return message.reply(lang.listening).catch(console.error);
                if (!message.member.voice) return message.reply(lang.novoicechannel).catch(console.error);
                if (Number(args[1]) > 1000 || Number(args[1]) < 0 || isNaN(args[1])) return;
                queue_.volume = args[1];
                queue_.connection.dispatcher.setVolumeLogarithmic(args[1] / 100);
                return client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.music_playing} **${queue.get(message.guild.id).songs[0].title}**.\n\n${lang.music_details}\n${lang.music_author} [${queue.get(message.guild.id).songs[0].author}](${queue.get(message.guild.id).songs[0].author_url})\n${lang.music_likeXdeslike} ${queue.get(message.guild.id).songs[0].likes}/${queue.get(message.guild.id).songs[0].dislikes}\n${lang.music_views} ${queue.get(message.guild.id).songs[0].viewCount}\n${lang.music_duration} ${queue.get(message.guild.id).songs[0].duration}\n\n${queue.get(message.guild.id).songs[1] == null ? `${lang.next_music} **${lang.none}**` : `${lang.next_music}  **${queue.get(message.guild.id).songs[1].title}**`}\n${pause == false ? `${lang.status_1} ${queue.get(message.guild.id).volume}%**` : `${lang.status_2}  ${queue.get(message.guild.id).volume}%**`}`))
            } else if (message.content.startsWith("lista") || message.content.startsWith("fila") || message.content.startsWith("queue")) {
                if (!queue_) return message.reply(lang.listening).catch(console.error);
                if (!message.member.voice) return message.reply(lang.novoicechannel).catch(console.error);
                return message.reply(new discord.MessageEmbed().setTitle(`**${lang.music_queue}**`).setColor("#36393f").setDescription(`` + (serverQueue.songs.map((track, i) => { return `**#${i + 1}** - ${track.title} | [(link)](${track.url})` }).slice(0, 10).join('\n')))).then(a => { setTimeout(() => { a.delete(); }, 5000); })
            }

            if (!url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)) return;
            if (!vc) return message.channel.send(lang.novoicechannel);

            let songinfo = await ytdl.getInfo(url);
            let song = {
                title: songinfo.videoDetails.title,
                url: songinfo.videoDetails.video_url,
                author: songinfo.videoDetails.author.name,
                author_url: songinfo.videoDetails.author.channel_url,
                duration: format(songinfo.videoDetails.lengthSeconds),
                viewCount: songinfo.videoDetails.viewCount,
                likes: songinfo.videoDetails.likes,
                dislikes: songinfo.videoDetails.dislikes
            }

            if (!serverQueue) {
                let queueConst = { textChannel: message.channel, voiceChannel: vc.channel, connection: null, songs: [], volume: 100, playing: true }; queue.set(message.guild.id, queueConst); queueConst.songs.push(song);
                try { let connection = await vc.channel.join(); queueConst.connection = connection; playSong(message.guild, queueConst.songs[0]); return client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.music_playing} **${queue.get(message.guild.id).songs[0].title}**.\n\n${lang.music_details}\n${lang.music_author} [${queue.get(message.guild.id).songs[0].author}](${queue.get(message.guild.id).songs[0].author_url})\n${lang.music_likeXdeslike} ${queue.get(message.guild.id).songs[0].likes}/${queue.get(message.guild.id).songs[0].dislikes}\n${lang.music_views} ${queue.get(message.guild.id).songs[0].viewCount}\n${lang.music_duration} ${queue.get(message.guild.id).songs[0].duration}\n\n${queue.get(message.guild.id).songs[1] == null ? `${lang.next_music} **${lang.none}**` : `${lang.next_music} **${queue.get(message.guild.id).songs[1].title}**`}\n${pause == false ? `${lang.status_1} ${queue.get(message.guild.id).volume}%**` : `${lang.status_2}  ${queue.get(message.guild.id).volume}%**`}`)) } catch (error) { queue.delete(message.guild.id); if (error) return; else return; }
            } else { serverQueue.songs.push(song); return client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.music_playing} **${queue.get(message.guild.id).songs[0].title}**.\n\n${lang.music_details}\n${lang.music_author} [${queue.get(message.guild.id).songs[0].author}](${queue.get(message.guild.id).songs[0].author_url})\n${lang.music_likeXdeslike} ${queue.get(message.guild.id).songs[0].likes}/${queue.get(message.guild.id).songs[0].dislikes}\n${lang.music_views} ${queue.get(message.guild.id).songs[0].viewCount}\n${lang.music_duration} ${queue.get(message.guild.id).songs[0].duration}\n\n${queue.get(message.guild.id).songs[1] == null ? `${lang.next_music} **${lang.none}**` : `${lang.next_music} **${queue.get(message.guild.id).songs[1].title}**`}\n${pause == false ? `${lang.status_1} ${queue.get(message.guild.id).volume}%**` : `${lang.status_2}  ${queue.get(message.guild.id).volume}%**`}`)) }

        }
    });

    async function playSong(guild, song) {
        let serverQueue = queue.get(guild.id);

        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.listening}`))
            listening = lang.listening
            return;
        }

        client.channels.cache.find((channel) => channel.name.toLowerCase() === settings.channel).messages.cache.get(messageid).edit(new discord.MessageEmbed().setColor("#36393f").setTitle(lang.radio_title).setDescription(`\n${lang.music_playing} **${song.title}**.\n\n${lang.music_details}\n${lang.music_author} [${song.author}](${song.author_url})\n${lang.music_likeXdeslike} ${song.likes}/${song.dislikes}\n${lang.music_views} ${song.viewCount}\n${lang.music_duration} ${song.duration}\n\n${serverQueue.songs[1] == null ? `${lang.next_music} **${lang.none}**` : `${lang.next_music} **${serverQueue.songs[1].title}**`}\n${pause == false ? `${lang.status_1} ${queue.get(guild.id).volume}%**` : `${lang.status_2}  ${queue.get(guild.id).volume}%**`}`))
        listening = song.title;
        dispatcher = await serverQueue.connection.play(ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' }));

        dispatcher.on('finish', () => { serverQueue.songs.shift(); playSong(guild, serverQueue.songs[0]); })
        dispatcher.on('error', () => { serverQueue.songs.shift(); playSong(guild, serverQueue.songs[0]); });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    }
}

module.exports.info = {
    modulename: 'MusicModule',
    moduleactive: true
};