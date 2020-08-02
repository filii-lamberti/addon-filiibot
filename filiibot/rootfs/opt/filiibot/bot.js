// Nodig voor externe files
const fs = require('fs');
// This contains our configuration
let options = {};
options.supervisorToken = process.env.SUPERVISOR_TOKEN;

if (!options.supervisorToken) {
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
const SuperAfk = require('./base/afk.js');
const SuperEnmap = require('./base/enmap.js');
const SuperMember = require('./base/member.js');
const SuperMqtt = require('./base/mqtt.js');
/* options = {
  logging, // status of logging
  debugging, // status of debugging
  prefix, // the message prefix
  token // the token of your bot
} */
const client = new SuperClient(options);
client.afk = new SuperAfk(client);
client.enmap = new SuperEnmap(client);
client.member = new SuperMember(client);
client.mqtt = new SuperMqtt(client);

// eslint-disable-next-line no-console
process.on('unhandledRejection', (error) => console.error('Uncaught Promise Rejection', error));

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.once('ready', () => client.onceReady());
