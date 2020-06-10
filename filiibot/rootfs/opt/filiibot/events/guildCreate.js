/*
 * This event triggers when the bot joins a guild.
 */
module.exports = {
  on(guild) {
    guild.client.log(
      `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`,
    );
  }
};
