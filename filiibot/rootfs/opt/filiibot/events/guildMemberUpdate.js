/*
 * This event triggers when 
 */
module.exports = {
  on(oldMember, newMember) {
    // If the nickname is the same, was [AFK] or is [AFK], do nothing.
    if (
      oldMember.nickname === newMember.nickname
      || !newMember.nickname
      || newMember.nickname.substring(0, 6) === '[AFK] '
      || !oldMember.nickname
      || oldMember.nickname.substring(0, 6) === '[AFK] '
    ) return;
    oldMember.client.log(`Name of "${oldMember.displayName}" changed to "${newMember.displayName}"`);
    oldMember.client.enmap.people.set(newMember.id, newMember.displayName, 'name');
  }
};
