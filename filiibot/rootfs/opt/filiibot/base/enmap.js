// Load Enmap
const Enmap = require('enmap');

class SuperEnmap {
  constructor(client) {
    this.client = client;

    // Enmap options
    options = {
      name: 'people',
      dataDir: options.enmapDataDir,
      ensureProps: true,
    };
    // Normal enmap with default options but custom data location
    people = new Enmap(options);

    // Wait for data to load
    people.defer.then(() => {
      this.client.log(`${people.size} keys loaded`);
      // Log our bot in
      this.client.login(token);
    });
  }
}

module.exports = SuperEnmap;
