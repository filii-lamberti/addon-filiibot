/*
 * This event triggers when an error occurs.
 */

module.exports = {
  name: 'error',
  execute(error) {
    console.log(error);
    // this.client.log(error);
    // this.client.enmap.people.close();
    // this.client.mqtt.client.end();
    process.exit(1);
  }
}
