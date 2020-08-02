const mqtt = require('mqtt');

// Gebruikt voor momenten
const moment = require('moment');
// Set the locale to dutch
moment.locale('nl');

// MQTT
class SuperMqtt {
  constructor(client) {
    this.client = client;

    this.filiikot = {
      humidity: 0,
      lastChanged: moment(0),
      lastUpdated: moment(0),
      people: 0,
      peopleNames: [],
      state: 'false',
      statusMessage: 'met de gevoelens van het filiikot',
      temperature: 0,
    };

    this.mqttClient = null;
    this.connect();
  }

  connect() {
    // MQTT options
    const options = {
      clientId: 'mqttjs_filiibot',
      username: 'ferre',
      password: 'ferre',
    };

    // Connect to the local MQTT broker
    this.mqttClient = mqtt.connect(this.client.config.mqttBrokerUrl, options);
    this.mqttClient.on('connect', this.onConnect); // When connected
    this.mqttClient.on('message', this.onMessage);
  }

  onConnect() {
    // this.client.log('MQTT connected');
    // subscribe to a topic
    this.mqttClient.subscribe('filiikot/+');
    // Inform controllers that garage is connected
    this.mqttClient.publish('filiikot/filiibot_connected', 'true');
  }

  onMessage(topic, message) {
    switch (topic) {
      case 'filiikot/humidity':
        this.filiikot.humidity = message.toString();
        this.client.log(`Vochtigheid: ${this.filiikot.humidity}`);
        break;

      case 'filiikot/last_changed':
        this.filiikot.lastChanged = moment(message.toString());
        this.client.log(`Last changed: ${this.filiikot.lastChanged}`);
        break;

      case 'filiikot/last_updated':
        this.filiikot.lastUpdated = moment(message.toString());
        this.client.log(`Last updated: ${this.filiikot.lastUpdated}`);
        break;

      case 'filiikot/people':
        this.filiikot.people = message.toString();
        this.client.log(`People: ${this.filiikot.people}`);
        break;

      case 'filiikot/people_names':
        this.filiikot.peopleNames = message.toString().split(',');
        this.client.log(`People names: ${this.filiikot.peopleNames}`);
        break;

      case 'filiikot/state':
        // message is Buffer
        this.filiikot.state = message.toString();
        this.client.log(`Status: ${this.filiikot.state}`);
        break;

      case 'filiikot/temperature':
        this.filiikot.temperature = message.toString();
        this.client.log(`Temperatuur: ${this.filiikot.temperature}`);
        break;

      default:
        return;
    }

    switch (this.filiikot.state) {
      case 'true':
        this.filiikot.statusMessage = `✅ Het filiikot is open sinds ${this.filiikot.lastChanged.format('HH:mm')}`;
        break;

      case 'false':
        this.filiikot.statusMessage = `🛑 Het filiikot is al ${this.filiikot.lastChanged.fromNow(true)} gesloten`;
        break;

      default:
        this.filiikot.statusMessage = 'met de gevoelens van het filiikot';
        break;
    }

    // Set the client user's activity
    if (this.client.readyTimestamp) {
      // the client is ready
      this.client.user
        .setActivity(this.filiikot.statusMessage, {
          url: 'https://ishetfiliikotopen.be/',
          type: 'PLAYING',
        })
        .then((presence) => this.client.log(`Activity set to ${presence.activities[0].name}`))
        // and catch the error
        .catch((error) => this.client.log(`Kon activity niet updaten omdat: ${error}`));
    }
  }
}

module.exports = SuperMqtt;
