/*
 * If the command is 'play'
 */
const { Util } = require('discord.js');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ytsr = require('ytsr');

const playSong = async (video, message) => {
  const serverQueue = message.client.queue.get(message.guild.id);

  if (!video) {
    serverQueue.voiceChannel.leave();
    message.client.queue.delete(message.guild.id);
    return;
  }

  const stream = ytdl(video.id, { filter: 'audioonly' });
  const dispatcher = serverQueue.connection.play(stream);
  dispatcher.on('finish', () => {
    serverQueue.songs.shift();
    playSong(serverQueue.songs[0], message);
  });
  dispatcher.on('error', (error) => {
    message.client.log(error);
  });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 250);
  serverQueue.textChannel.send(`🎶 Now playing **${video.title}**`);
  message.client.log(`Filiibot plays ${video.title} now.`);
};

const queueSong = async (video, message) => {
  const serverQueue = message.client.queue.get(message.guild.id);
  const voiceChannel = message.member.voice.channel;
  const textChannel = message.channel;

  if (!serverQueue) {
    const queueConstruct = {
      textChannel,
      voiceChannel,
      connection: null,
      songs: [video],
      volume: 50,
      playing: true,
    };

    try {
      const connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      message.client.queue.set(message.guild.id, queueConstruct);
      playSong(queueConstruct.songs[0], message);
    } catch (error) {
      message.client.log(`I could not join the voice channel: ${error}`);
      message.channel.send('❌ An unknown error occoured upon trying to join the voice channel!');
      message.client.queue.delete(message.guild.id);
      // await voiceChannel.leave();
    }
  } else {
    serverQueue.songs.push(video);
    message.client.log(serverQueue.songs);
  }
};

module.exports = {
  name: 'play',
  description: 'Play command.',
  usage: '[command name]',
  args: true,
  cooldown: 5,
  async execute(message, args) {
    if (message.channel.type !== 'text') return;

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      message.reply('Please join a voice channel first!');
      return;
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) {
      message.channel.send('❌ I don\'t have permission to connect to the voice channel!');
      return;
    }
    if (!permissions.has('SPEAK')) {
      message.channel.send('❌ I don\'t have permission to speak in the voice channel!');
      return;
    }

    const argsJoined = args.join(' ');

    if (ytdl.validateURL(argsJoined)
      || ytdl.validateID(argsJoined)) {
      // Gets metainfo from a video.Includes additional formats, and ready to
      // download deciphered URL.This is what the ytdl() function uses internally.
      const songInfo = await ytdl.getBasicInfo(argsJoined);
      const song = {
        id: songInfo.videoDetails.videoId,
        title: Util.escapeMarkdown(songInfo.videoDetails.title),
        url: songInfo.videoDetails.video_url,
      };
      queueSong(song, message);
      message.channel.send(`✅ **${song.title}** has been added to the queue!`);
    } else if (ytpl.validateURL(argsJoined)) {
      message.client.log('dit is een playlist');

      ytpl(argsJoined, (err, playlist) => {
        if (err) throw err;
        const videos = playlist.items;

        for (const video of videos) {
          const song = {
            id: video.id,
            title: video.title,
            url: video.url_simple,
          };
          queueSong(song, message);
        }

        message.channel.send(`✅ Playlist **${playlist.title}** (${videos.length}) has been added to the queue!`);
      });
    } else {
      const searchOptions = {
        limit: 5,
      };

      ytsr(argsJoined, searchOptions, (err, searchResults) => {
        if (err) throw err;
        const videos = searchResults.items;

        for (const video of videos) {
          const song = {
            id: video.link.slice(32),
            title: video.title,
            url: video.link,
          };
          queueSong(song, message);
        }
        message.client.log();
      });
    }
  },
};
