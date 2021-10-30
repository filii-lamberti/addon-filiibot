/*
 * This event triggers when a new member joins the guild.
 */
// Needed for external files
const fs = require('fs');
// Read the external file
const welcomeDm = fs.readFileSync('./welcomeDm.txt', 'utf8');

module.exports = {
  name: 'GuildMemberAdd',
  description: 'Welkomstbericht voor nieuwe leden',
  execute(client, member) {
    // Log the event
    console.log(`${member.user.username} joined the guild ${member.guild.name}`);
    // If the new member is a bot, do nothing
    if (member.user.bot) return;
    // Get the specific role
    const role = member.guild.roles.get('492090623919390761');
    // If the role is not found, do nothing
    if (!role) return;
    // Add the role to the new member
    member.roles.add(role);
    // Get the welcome channel
    const channel = member.guild.channels.get('471384915355631626');
    // If the channel is not found, do nothing
    if (!channel) return;
    // Send a message to the welcome channel
    channel.send(`Welkom op de Discordserver van Filii Lamberti, ${member}`);
    // Send a DM to the new member
    member.send(welcomeDm);
  },
};
