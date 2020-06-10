/*
 * This event triggers when 
 */
module.exports = {
  on(error) {
    client.log(error);
    client.enmap.people.close();
    client.mqtt.client.end();
    process.exit(1);
  }
};
