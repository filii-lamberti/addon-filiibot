/*
 * this event triggers when the bot is removed from a guild.
 */
class GuildDelete {
  constructor(client) {
    this.client = client;
  }

  on(guild) {
    guild.client.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  }
}

module.exports = GuildDelete;
