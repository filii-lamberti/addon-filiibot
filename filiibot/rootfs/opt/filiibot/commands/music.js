// stop
// play
// pause
// search
// np
// Load up the discord.js library
const { Collection } = require('discord.js');
// Nodig voor externe files
const fs = require('fs');

module.exports = {
  name: 'music',
  description: 'Music!',
  execute(message, _args) {
    const subCommandName = _args[0].toLowerCase();
    const subCommands = new Collection();

    message.client.log('music')

    const musicVoiceChannel = message.client.channels.cache.get('471387094242033674');
    const musicTextChannel = message.client.channels.cache.get('471386777526075403');

    const subCommandFiles = fs.readdirSync('./music').filter((file) => file.endsWith('.js'));
    for (const file of subCommandFiles) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const subCommand = require(`../music/${file}`);
      // set a new item in the Collection
      // with the key as the command name and the value as the exported module
      subCommands.set(subCommand.name, subCommand);
    }

    if (!subCommands.has(subCommandName)) return;
    const subCommand = subCommands.get(subCommandName);
    subCommand.execute(message, _args);

    /* switch (subCommandName) {
      case 'play':
      default:
    } */
  },
};
