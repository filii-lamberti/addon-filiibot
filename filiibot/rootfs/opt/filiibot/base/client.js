// Load up the discord.js library
const { Client, Collection } = require('discord.js');
// Nodig voor externe files
const fs = require('fs');

/**
 * Represents a Discord client
 * @extends Discord.Client
 */
class SuperClient extends Client {
  constructor(config) {
    super();

    this.commands = new Collection();

    this.config = config;

    // prints if logging is true
    if (config.logging) {
      this.log('Logging is enabled');
    }
    // prints if debugging is true
    if (config.debugging) {
      this.log('Debugging is enabled');
      process.env.DEBUG = '*';
    }
    // prints the prefix and token
    this.log(`
      Prefix: ${config.prefix}
      Token: ${config.token}
    `);

    this.loadCommands();
    this.loadEvents();
  }

  // filter console logs
  log(message) {
    if (this.config.logging) {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  }

  loadCommands() {
    const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const command = require(`../commands/${file}`);
      // set a new item in the Collection
      // with the key as the command name and the value as the exported module
      this.commands.set(command.name, command);
    }
  }

  loadEvents() {
    const eventFiles = fs.readdirSync('./events').filter((file) => file.endsWith('.js'));
    for (const file of eventFiles) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const event = new (require(`../events/${file}`))(this);
      super.on(file.split('.')[0], (...args) => event.on(...args));
    }
  }
}

module.exports = SuperClient;
