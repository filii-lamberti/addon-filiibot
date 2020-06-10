

client.on('guildMemberUpdate', (oldMember, newMember) => {
  // If the nickname is the same, was [AFK] or is [AFK], do nothing.
  if (
    oldMember.nickname === newMember.nickname
    || !newMember.nickname
    || newMember.nickname.substring(0, 6) === '[AFK] '
    || !oldMember.nickname
    || oldMember.nickname.substring(0, 6) === '[AFK] '
  ) return;
  client.log(`Name of "${oldMember.displayName}" changed to "${newMember.displayName}"`);
  client.enmap.people.set(newMember.id, newMember.displayName, 'name');
});