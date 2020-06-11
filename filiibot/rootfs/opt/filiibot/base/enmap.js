

// Load Enmap
client.enmap = {};
const Enmap = require('enmap');
// Enmap options
client.enmap.options = {
    name: 'people',
    dataDir: options.enmapDataDir,
    ensureProps: true,
};
// Normal enmap with default options but custom data location
client.enmap.people = new Enmap(client.enmap.options);

// Wait for data to load
client.enmap.people.defer.then(() => {
    client.log(`${client.enmap.people.size} keys loaded`);
    // Log our bot in
    client.login(token);
});