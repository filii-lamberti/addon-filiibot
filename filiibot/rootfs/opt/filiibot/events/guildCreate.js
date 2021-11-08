/*
 * This event triggers when the bot joins a guild.
 */

module.exports = {
    name: 'GuildCreate',
    description: 'This event triggers when the bot joins a guild.',
    execute(client, guild) {
        console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
        client.user.setActivity(`Serving ${client.guilds.size} servers`);
    },
};
