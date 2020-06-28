// Load Enmap
const Enmap = require('enmap');

class SuperEnmap extends Enmap {
  constructor(client) {
    // Enmap options
    const options = {
      name: 'people',
      dataDir: client.config.enmapDataDir,
      ensureProps: true,
    };

    // Normal enmap with default options but custom data location
    super(options);

    this.client = client;

    // Wait for data to load
    this.defer.then(() => {
      this.client.log(`${this.size} keys loaded`);
      // Log our bot in
      this.client.login(client.config.token);
    });
  }
}

module.exports = SuperEnmap;
