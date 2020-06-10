

// this event triggers when the bot is removed from a guild.
client.on('guildDelete', (guild) => {
  client.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});