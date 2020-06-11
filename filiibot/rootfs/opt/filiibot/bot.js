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

const SuperClient = require('./base/client.js');
/* options = {
  logging, // status of logging
  debugging, // status of debugging
  prefix, // the message prefix
  token // the token of your bot
} */
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
