class SuperAfk {
  constructor(client) {
    this.client = client;
  }

  set(member, reason = ':zzz:') {
    // Set the nickname for this member.
    member
      .setNickname(`[AFK] ${this.client.enmap.get(member.id, 'name')}`)
      .then((mbr) => {
        this.client.log(`Changed the AFK nickname to ${mbr.nickname}`);
        this.client.enmap.push('afkMembers', member.id);
        this.client.enmap.set(member.id, true, 'afk');
        this.client.enmap.set(member.id, reason, 'reason');
      })
      // catch delete error
      .catch((error) => this.client.log(`Kon nickname niet veranderen omdat: ${error}`));
  }

  clear(member) {
    // Set the nickname for this member.
    member
      .setNickname(this.client.enmap.get(member.id, 'name'))
      .then((mbr) => {
        this.client.log(`Changed the nickname back to ${mbr.nickname}`);
        this.client.enmap.remove('afkMembers', member.id);
        this.client.enmap.set(member.id, false, 'afk');
        this.client.enmap.set(member.id, '', 'reason');
      })
      // catch delete error
      .catch((error) => this.client.log(`Kon nickname niet veranderen omdat: ${error}`));
  }
}

module.exports = SuperAfk;
