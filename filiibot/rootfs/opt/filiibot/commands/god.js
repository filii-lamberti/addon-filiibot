// If the command is 'god'
case 'god': {
    if (!isMemberPraesidium(message)) return;

    log('Ever wanted to be a god?');
    const roleGod = message.guild.roles.cache.find((role) => role.name === 'Server God');
    if (!roleGod) return;
    // args[0] = status
    log(`Turning God Mode ${args[0].toLowerCase()} for ${member.displayName}`);

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
        return;
    }
    break;
}