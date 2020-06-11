

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