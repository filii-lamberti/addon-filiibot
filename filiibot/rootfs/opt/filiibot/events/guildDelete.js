/*
 * This event triggers when the bot is removed from a guild.
 */

module.exports = {
  name: 'GuildDelete',
    description: 'This event triggers when the bot is removed from a guild.',
    execute(client, guild) {
        console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    }
};
