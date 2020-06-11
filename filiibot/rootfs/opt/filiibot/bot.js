const supervisorToken = process.env.SUPERVISOR_TOKEN;

// Nodig voor externe files
const fs = require('fs');
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

// status of logging and debugging
const { logging, debugging } = options;
// the message prefix and token of your bot
const { prefix, token } = options;

const SuperClient = require('./base/client.js');
const client = new SuperClient(options);

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
