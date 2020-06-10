/*
 * this event triggers when the bot is removed from a guild.
 */
module.exports = {
  on(guild) {
    guild.client.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  }
};
