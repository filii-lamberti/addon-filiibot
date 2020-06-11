/*
 * This event triggers when
 */
class Error {
  constructor(client) {
    this.client = client;
  }

  on(error) {
    this.client.log(error);
    this.client.enmap.people.close();
    this.client.mqtt.client.end();
    process.exit(1);
  }
}

module.exports = Error;
