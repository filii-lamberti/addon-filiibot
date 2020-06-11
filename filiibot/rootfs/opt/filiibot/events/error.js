/*
 * This event triggers when
 */
class Error {
  constructor(client) {
    this.client = client;
  }

  on(error) {
    client.log(error);
    client.enmap.people.close();
    client.mqtt.client.end();
    process.exit(1);
  }
};

module.exports = Error;
