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
    this.cooldowns = new Collection();
    this.queue = new Map();
    this.config = config;
    this.filiiGuild = '';

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

  onceReady() {
    // This event will run if the bot starts, and logs in, successfully.
    this.log(`Bot is klaar, ik ben ingelogd als ${this.user.tag}!`);
    // Should only have 1 guild
    this.log(
      `Serving ${this.users.cache.size} users
    in ${this.channels.cache.size} channels
    of ${this.guilds.cache.size} server.`,
    );

    // Change the bot's playing game to something useless
    this.user.setActivity('met de gevoelens van het filiikot');

    // Get the Filii Guild by ID from all Guilds
    const filiiGuild = this.guilds.cache.get('238704983468539905');

    // Check for all members from the Filii Guild
    for (const [key, value] of filiiGuild.members.cache) {
      this.enmap.ensure(key, {
        id: key,
        name: value.displayName,
        afk: false,
        reason: '',
        type: '',
        keyword: '',
        selection: 0,
        searchResult: [],
      });
    }
    this.enmap.ensure('afkMembers', []);
  }
}

module.exports = SuperClient;
