/*
 * If the command is 'god'
 */
module.exports = {
  name: 'god',
  description: 'God!',
  execute(message, args) {
    if (!message.client.member.constructor.praesidium(message)) return;
    // The user you want to add a role to
    const member = message.client.member.constructor.which(message);

    message.client.log('Ever wanted to be a god?');
    const roleGod = message.guild.roles.cache.get('240103009944731648');
    if (!roleGod) return;
    // args[0] = status
    message.client.log(`Turning God Mode ${args[0].toLowerCase()} for ${member.displayName}`);

    switch (args[0].toLowerCase()) {
      case 'on':
        // Add the god role!
        member.roles.add(roleGod);
        break;
      case 'off':
        // Remove a role!
        member.roles.remove(roleGod);
        break;
      default:
        break;
    }
  },
};
