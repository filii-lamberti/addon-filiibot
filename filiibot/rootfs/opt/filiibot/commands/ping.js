/*
 * If the command is 'ping'
 * Calculates ping between sending a message and editing it, giving a nice round-trip latency.
 * The second ping is an average latency between the bot and the websocket server
 * (one-way, not round-trip)
 */
module.exports = {
  name: 'ping',
  cooldown: 5,
  description: 'Ping!',
  async execute(message, _args) {
    const m = await message.channel.send('Ping?');
    m.edit(
      `Pong! Wachttijd is ${m.createdTimestamp - message.createdTimestamp}ms,
      API wachttijd is ${Math.round(message.client.ws.ping)}ms.`,
    );
  },
};
