/*
 * This event triggers when a member is updated in a guild.
 */

module.exports = {
  name: 'guildMemberUpdate',
  description: 'This event triggers when a member is updated in a guild.',
  execute(client, oldMember, newMember) {
    // If the nickname is the same, was [AFK] or is [AFK], do nothing
    if (
      oldMember.nickname === newMember.nickname ||
      !oldMember.nickname ||
      oldMember.nickname.substring(0, 6) === '[AFK] ' ||
      !newMember.nickname ||
      newMember.nickname.substring(0, 6) === '[AFK] '
    ) return;
    // Log the nickname change
    console.log(`Name of "${oldMember.displayName}" changed to "${newMember.displayName}"`);
    // Save the nickname change to the database
    // oldMember.client.enmap.people.set(newMember.id, newMember.displayName, 'name');
  }
}
