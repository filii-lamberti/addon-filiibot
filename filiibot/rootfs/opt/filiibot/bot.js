const supervisorToken = process.env.SUPERVISOR_TOKEN;

// Nodig voor externe files
const fs = require('fs');
// Lees de externe file
const welcomeDm = fs.readFileSync('./welcomeDm.txt', 'utf8');
// This contains our configuration
let options;

if (!supervisorToken) {
  // eslint-disable-next-line no-console
  console.log('You are not running this as an Home Assistant add-on!');
  // Here we import the options.json file
  options = JSON.parse(fs.readFileSync('./options.json', 'utf8'));
  options.enmapDataDir = './data';
  options.mqttBrokerUrl = 'mqtt://localhost';
} else {
  // from the add-on persistent data directory
  options = JSON.parse(fs.readFileSync('/data/options.json', 'utf8'));
  options.enmapDataDir = '/data';
  options.mqttBrokerUrl = 'mqtt://core-mosquitto';
}

// Load up the discord.js library
const Discord = require('discord.js');
// Create an instance of a Discord client
const client = new Discord.Client();

// status of logging and debugging
const { logging, debugging } = options;
// filter console logs
client.log = (message) => {
  if (logging) {
    // eslint-disable-next-line no-console
    console.log(message);
  }
};
// prints if logging is true
if (logging) {
  client.log('Logging is enabled');
}
// prints if debugging is true
if (debugging) {
  client.log('Debugging is enabled');
  process.env.DEBUG = '*';
}

// the message prefix and token of your bot
const { prefix, token } = options;
// prints the prefix and token
client.log(`
  Prefix: ${prefix}
  Token: ${token}
`);

// HTTP REST API
const axios = require('axios');
// Supervisor REST API
client.supervisorRequest = axios.create({
  baseURL: 'http://supervisor/',
  headers: {
    Authorization: `Bearer ${supervisorToken}`,
    'Content-Type': 'application/json',
  },
});

// eslint-disable-next-line no-console
process.on('unhandledRejection', (error) => console.error('Uncaught Promise Rejection', error));

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const command = require(`./commands/${file}`);
  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.name, command);
}

// Gebruikt voor momenten
const moment = require('moment');
// Set the locale to dutch
moment.locale('nl');

client.filiikot = {
  humidity: 0,
  lastChanged: moment(0),
  lastUpdated: moment(0),
  people: 0,
  peopleNames: [],
  state: 'false',
  statusMessage: 'met de gevoelens van het filiikot',
  temperature: 0,
};

// Load Enmap
client.enmap = {};
const Enmap = require('enmap');
// Enmap options
client.enmap.options = {
  name: 'people',
  dataDir: options.enmapDataDir,
  ensureProps: true,
};
// Normal enmap with default options but custom data location
client.enmap.people = new Enmap(client.enmap.options);

// Wait for data to load
client.enmap.people.defer.then(() => {
  client.log(`${client.enmap.people.size} keys loaded`);
  // Log our bot in
  client.login(token);
});

// MQTT
client.mqtt = {};
const MQTT = require('mqtt');
// MQTT options
client.mqtt.options = {
  clientId: 'mqttjs_filiibot',
  username: 'ferre',
  password: 'ferre',
};
// Connect to the local MQTT broker
client.mqtt.client = MQTT.connect(options.mqttBrokerUrl, client.mqtt.options);

client.mqtt.client.on('connect', () => { // When connected
  client.log('MQTT connected');
  // subscribe to a topic
  client.mqtt.client.subscribe('filiikot/+');
  // Inform controllers that garage is connected
  client.mqtt.client.publish('filiikot/filiibot_connected', 'true');
});

client.mqtt.client.on('message', (topic, message) => {
  switch (topic) {
    case 'filiikot/humidity':
      client.filiikot.humidity = message.toString();
      client.log(`Vochtigheid: ${client.filiikot.humidity}`);
      break;

    case 'filiikot/last_changed':
      client.filiikot.lastChanged = moment(message.toString());
      client.log(`Last changed: ${client.filiikot.lastChanged}`);
      break;

    case 'filiikot/last_updated':
      client.filiikot.lastUpdated = moment(message.toString());
      client.log(`Last updated: ${client.filiikot.lastUpdated}`);
      break;

    case 'filiikot/people_names':
      client.filiikot.peopleNames = message.toString().split(',');
      client.log(`People names: ${client.filiikot.peopleNames}`);
      break;

    case 'filiikot/people':
      client.filiikot.people = message.toString();
      client.log(`People: ${client.filiikot.people}`);
      break;

    case 'filiikot/state':
      // message is Buffer
      client.filiikot.state = message.toString();
      client.log(`Status: ${client.filiikot.state}`);
      break;

    case 'filiikot/temperature':
      client.filiikot.temperature = message.toString();
      client.log(`Temperatuur: ${client.filiikot.temperature}`);
      break;

    default:
      return;
  }

  switch (client.filiikot.state) {
    case 'true':
      client.filiikot.statusMessage = `✅ Het filiikot is open sinds ${client.filiikot.lastChanged.format('HH:mm')}`;
      break;

    case 'false':
      client.filiikot.statusMessage = `🛑 Het filiikot is al ${client.filiikot.lastChanged.fromNow(true)} gesloten`;
      break;

    default:
      client.filiikot.statusMessage = 'met de gevoelens van het filiikot';
      break;
  }

  // Set the client user's activity
  if (client.readyTimestamp) {
    // the client is ready
    client.user
      .setActivity(client.filiikot.statusMessage, {
        url: 'https://ishetfiliikotopen.be/',
        type: 'PLAYING',
      })
      .then((presence) => client.log(`Activity set to ${presence.activities[0].name}`))
      // and catch the error
      .catch((error) => client.log(`Kon activity niet updaten omdat: ${error}`));
  }
});

client.afk = {};
client.afk.set = (member, reason = ':zzz:') => {
  // Set the nickname for this member.
  member
    .setNickname(`[AFK] ${client.enmap.people.get(member.id, 'name')}`)
    .then((mbr) => {
      client.log(`Changed the AFK nickname to ${mbr.nickname}`);
      client.enmap.people.push('afkMembers', member.id);
      client.enmap.people.set(member.id, true, 'afk');
      client.enmap.people.set(member.id, reason, 'reason');
    })
    // catch delete error
    .catch((error) => client.log(`Kon nickname niet veranderen omdat: ${error}`));
};

client.afk.clear = (member) => {
  // Set the nickname for this member.
  member
    .setNickname(client.enmap.people.get(member.id, 'name'))
    .then((mbr) => {
      client.log(`Changed the nickname back to ${mbr.nickname}`);
      client.enmap.people.remove('afkMembers', member.id);
      client.enmap.people.set(member.id, false, 'afk');
      client.enmap.people.set(member.id, '', 'reason');
    })
    // catch delete error
    .catch((error) => client.log(`Kon nickname niet veranderen omdat: ${error}`));
};

client.member = {};
// Is the message author part of Praesidium?
client.member.praesidium = (message) => {
  if (message.member.roles.cache.find((role) => role.name === 'Praesidium')) return true;
  message.reply('sorry, you need to be Praesidium to use this!');
  return false;
};

// Is the message author a Server God?
client.member.serverGod = (message) => {
  if (message.member.roles.cache.find((role) => role.name === 'Server God')) return true;
  message.reply('sorry, you need to be a Server God to use this!');
  return false;
};

// Was there a member mentioned?
client.member.which = (message) => {
  if (message.mentions.members.size === 0) {
    // Use the person who made the command
    return message.member;
  }
  // Use the person you mentioned
  return message.mentions.members.first();
};

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.once('ready', () => {
  // This event will run if the bot starts, and logs in, successfully.
  client.log(`Bot is klaar, ik ben ingelogd als ${client.user.tag}!`);
  // Should only have 1 guild
  client.log(
    `Serving ${client.users.cache.size} users
    in ${client.channels.cache.size} channels
    of ${client.guilds.cache.size} server.`,
  );

  // Change the bot's playing game to something useless
  client.user.setActivity('met de gevoelens van het filiikot');

  // Get the Filii Guild by ID from all Guilds
  const filiiGuild = client.guilds.cache.get('238704983468539905');
  // Check for all members from the Filii Guild
  for (const [key, value] of filiiGuild.members.cache) {
    client.enmap.people.ensure(key, {
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
  client.enmap.people.ensure('afkMembers', []);
});

client.on('error', (error) => {
  client.log(error);
  client.enmap.people.close();
  client.mqtt.client.end();
  process.exit(1);
});

// This event triggers when the bot joins a guild.
client.on('guildCreate', (guild) => {
  client.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`,
  );
});

// this event triggers when the bot is removed from a guild.
client.on('guildDelete', (guild) => {
  client.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

// Create an event listener for new guild members
client.on('guildMemberAdd', (member) => {
  client.log(`New User "${member.displayName}" has joined "${member.guild.name}"`);
  // If the joined member is a bot, do nothing.
  if (member.user.bot) return;
  const roleLid = member.guild.roles.cache.find((role) => role.name === 'Leden');
  if (!roleLid) return;
  member.roles.add(roleLid);
  // Send the message to a designated channel on a server:
  const welcomeChannel = member.guild.channels.cache.find((channel) => channel.name === 'aankondigingen');
  // Do nothing if the channel wasn't found on this server
  if (!welcomeChannel) return;
  // Send the message, mentioning the member
  welcomeChannel.send(`Welkom op de Discordserver van Filii Lamberti, ${member}!`);
  member.send(welcomeDm);
});

client.on('guildMemberRemove', (member) => {
  client.log(`User "${member.displayName}" has left "${member.guild.name}"`);
  // If the joined member is a bot, do nothing.
  if (member.user.bot) return;
  // Send the message to a designated channel on a server:
  const welcomeChannel = member.guild.channels.cache.find((channel) => channel.name === 'aankondigingen');
  // Do nothing if the channel wasn't found on this server
  if (!welcomeChannel) return;
  // Send the message, mentioning the member
  welcomeChannel.send(`Vaarwel, ${member}, u joinde ${moment(member.joinedAt).fromNow()}.`);
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  // If the nickname is the same, was [AFK] or is [AFK], do nothing.
  if (
    oldMember.nickname === newMember.nickname
    || !newMember.nickname
    || newMember.nickname.substring(0, 6) === '[AFK] '
    || !oldMember.nickname
    || oldMember.nickname.substring(0, 6) === '[AFK] '
  ) return;
  client.log(`Name of "${oldMember.displayName}" changed to "${newMember.displayName}"`);
  client.enmap.people.set(newMember.id, newMember.displayName, 'name');
});

// This event will run on every single message received, from any channel or DM.
client.on('message', async (message) => {
  // Negeren als het bericht van een bot komt
  if (message.author.bot) return;
  // Store the original message
  const messageTrimmed = message.content.trim();

  const afkMembers = client.enmap.people.get('afkMembers');
  if (afkMembers.includes(message.author.id)) {
    client.afk.clear(message.member);
  }

  const mentionedAfkMembers = afkMembers.filter((element) => message.mentions.members.has(element));
  mentionedAfkMembers.forEach((element) => {
    message.reply(`${client.enmap.people.get(element, 'name')} is momenteel AFK met als reden: "${client.enmap.people.get(element, 'reason')}".`);
  });

  // ik ben of kben of... at the beginning
  const regexBen = /^i?k\s*ben\s+/im;
  // test het bericht op regexBen
  if (regexBen.test(messageTrimmed)) {
    // reply but replace the beginning
    message.channel.send(`Dag ${messageTrimmed.replace(regexBen, '')}, ik ben de Filiibot!`);
  }

  // 12 of twaalf of dozijn als woord
  const regexTwaalf = /\b(1 ?2|t ?w ?a ?a ?l ?f|d ?o ?z ?i ?j ?n)\b/i;
  // test het bericht op regexTwaalf
  if (regexTwaalf.test(messageTrimmed)) {
    message.reply('twaalf is zekerheid!');
  }

  // Otherwise check if the prefix is there
  if (!messageTrimmed.startsWith(prefix)) return;
  // Remove the prefix from the message
  const messageSliced = messageTrimmed.slice(prefix.length);
  // To get the "message" itself we join the array back into a string with spaces
  const args = messageSliced.split(/\s+/g);

  const commandName = args.shift().toLowerCase();
  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);
  // Negeren als het een DM is
  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply(
      'Het spijt me zeer, maar ik ben momenteel niet geïnteresseerd in persoonlijke relaties. Ik heb mijn handen al vol met Filii te dienen!',
    );
  }
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    return message.channel.send(reply);
  }
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});
