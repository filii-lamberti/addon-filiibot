/*
 * If the command is 'play'
 */
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ytsr = require('ytsr');

module.exports = {
  name: 'play',
  description: 'Play!',
  execute(message, args) {
    if (message.channel.type !== 'text') return;

    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      message.reply('Please join a voice channel first!');
      return;
    }

    voiceChannel.join().then((connection) => {
      if (ytdl.validateURL(args.join(' '))
        || ytdl.validateID(args.join(' '))) {
        message.client.log(`Filiibot plays ${args.join(' ')} now.`);
        const stream = ytdl(args.join(' '), { filter: 'audioonly' });
        const dispatcher = connection.play(stream);

        dispatcher.on('finish', () => voiceChannel.leave());
      } else if (ytpl.validateURL(args.join(' '))) {
        message.client.log('dit is een playlist');

        ytpl(args.join(' '), (err, playlist) => {
          if (err) throw err;
          message.client.log(playlist.items);

          const stream = ytdl(playlist.items[0].id, { filter: 'audioonly' });
          const dispatcher = connection.play(stream);

          dispatcher.on('finish', () => voiceChannel.leave());
        });
      } else {
        const searchOptions = {
          limit: 5,
        };

        ytsr(args.join(' '), searchOptions, (err, searchResults) => {
          if (err) throw err;
          message.client.log(searchResults);
        });
      }
    });
  },
};
