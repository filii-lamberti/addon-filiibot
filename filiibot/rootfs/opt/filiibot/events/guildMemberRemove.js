// Gebruikt voor momenten
const moment = require('moment');
// Set the locale to dutch
moment.locale('nl');

/*
 * This event triggers when
 */
class GuildMemberRemove {
  constructor(client) {
    this.client = client;
  }

  on(member) {
    this.client.log(`User "${member.displayName}" has left "${member.guild.name}"`);
    // If the joined member is a bot, do nothing.
    if (member.user.bot) return;
    // Send the message to a designated channel on a server:
    const welcomeChannel = member.guild.channels.cache.get('471384915355631626');
    // Do nothing if the channel wasn't found on this server
    if (!welcomeChannel) return;
    // Send the message, mentioning the member
    welcomeChannel.send(`Vaarwel, ${member}, u joinde ${moment(member.joinedAt).fromNow()}.`);
  }
}

module.exports = GuildMemberRemove;
