/*
 * If the command is 'role'
 */
module.exports = {
  name: 'role',
  description: 'Role!',
  execute(message, args) {
    if (!message.client.member.praesidium(message)) return;

    log('Doing some roleplay?');
    // Can't use the next thing because otherwise they would get notified
    // let role = message.mentions.roles.cache.first();
    const roleCommilito = message.guild.roles.cache.find((role) => role.name === 'Commilitones');
    const roleOZ = message.guild.roles.cache.find((role) => role.name === 'Ouw Zakken');
    const roleSchacht = message.guild.roles.cache.find((role) => role.name === 'Schachten (dom dom)');
    const roleLid = message.guild.roles.cache.find((role) => role.name === 'Leden');
    const rolePS = message.guild.roles.cache.find((role) => role.name === 'Praesidium');

    // args[0] = what
    log(`Let's use ${args[0].toLowerCase()}`);
    switch (args[0].toLowerCase()) {
    case 'ontgroen':
        mentionedMembers.forEach((mentionedMember) => {
        mentionedMember.roles.remove(roleSchacht);
        mentionedMember.roles.add(roleCommilito)
            .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
            // and catch the error
            .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
        });
        break;

    case 'pensioen':
        mentionedMembers.forEach((mentionedMember) => {
        mentionedMember.roles.remove(rolePS);
        mentionedMember.roles.add(roleOZ)
            .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
            // and catch the error
            .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
        });
        break;

    case 'dom':
        mentionedMembers.forEach((mentionedMember) => {
        mentionedMember.roles.add(roleSchacht)
            .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
            // and catch the error
            .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
        });
        break;

    case 'lid':
        mentionedMembers.forEach((mentionedMember) => {
        mentionedMember.roles.add(roleLid)
            .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
            // and catch the error
            .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
        });
        break;

    case 'ps':
        mentionedMembers.forEach((mentionedMember) => {
        mentionedMember.roles.add(rolePS)
            .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
            // and catch the error
            .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
        });
        break;

    default:
        return;
    }
  },
};
