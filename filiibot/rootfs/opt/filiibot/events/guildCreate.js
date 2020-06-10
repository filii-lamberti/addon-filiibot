/*
 * This event triggers when the bot joins a guild.
 */
module.exports = class {
  constructor(client) {
    this.client = client;
  }

  run(guild) {
    client.log(
      `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`,
    );
  }
};
