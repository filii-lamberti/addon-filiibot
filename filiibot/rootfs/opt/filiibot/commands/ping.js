module.exports = {
  name: 'ping',
  description: 'Ping!',
  async execute(message, args) {
    message.channel.send('Pong.');
    const m = await message.channel.send('Ping?');
    m.edit(
      `Pong! Wachttijd is ${m.createdTimestamp - message.createdTimestamp}ms. API wachttijd is ${Math.round(discordClient.ws.ping)}ms`,
    );
  },
};
