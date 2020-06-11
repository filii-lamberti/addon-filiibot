/*
 * Create an event listener for new guild members
 */
// Nodig voor externe files
const fs = require('fs');
// Lees de externe file
const welcomeDm = fs.readFileSync('./welcomeDm.txt', 'utf8');

class GuildMemberAdd {
  constructor(client) {
    this.client = client;
  }

  on(member) {
    member.client.log(`New User "${member.displayName}" has joined "${member.guild.name}"`);
    // If the joined member is a bot, do nothing.
    if (member.user.bot) return;
    const roleLid = member.guild.roles.cache.find((role) => role.name === 'Leden');
    if (!roleLid) return;
    member.roles.add(roleLid);
    // Send the message to a designated channel on a server:
    const welcomeChannel = member.guild.channels.cache.find((channel) => channel.name === 'aankondigingen');
    // Do nothing if the channel wasn't found on this server
    if (!welcomeChannel) return;
    // Send the message, mentioning the member
    welcomeChannel.send(`Welkom op de Discordserver van Filii Lamberti, ${member}!`);
    member.send(welcomeDm);
  }
}

module.exports = GuildMemberAdd;
