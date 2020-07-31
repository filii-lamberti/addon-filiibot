/*
 * This event triggers when
 */
class GuildMemberUpdate {
  constructor(client) {
    this.client = client;
  }

  on(oldMember, newMember) {
    // If the nickname is the same, was [AFK] or is [AFK], do nothing.
    if (
      oldMember.nickname === newMember.nickname
      || !newMember.nickname
      || newMember.nickname.substring(0, 6) === '[AFK] '
      || !oldMember.nickname
      || oldMember.nickname.substring(0, 6) === '[AFK] '
    ) return;
    this.client.log(`Name of "${oldMember.displayName}" changed to "${newMember.displayName}"`);
    oldMember.client.enmap.people.set(newMember.id, newMember.displayName, 'name');
  }
}

module.exports = GuildMemberUpdate;
