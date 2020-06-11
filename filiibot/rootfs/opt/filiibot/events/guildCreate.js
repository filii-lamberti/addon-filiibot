/*
 * This event triggers when the bot joins a guild.
 */
class GuildCreate {
  constructor(client) {
    this.client = client;
  }

  on(guild) {
    guild.client.log(
      `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`,
    );
  }
};

module.exports = GuildCreate;
