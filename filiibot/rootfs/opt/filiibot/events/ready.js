// When the client is ready, run this code (only once).

module.exports = {
    name: 'ready',
    description: 'When the client is ready, run this code.',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
    },
};