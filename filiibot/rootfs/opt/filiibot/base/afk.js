

client.afk = {};
client.afk.set = (member, reason = ':zzz:') => {
    // Set the nickname for this member.
    member
        .setNickname(`[AFK] ${client.enmap.people.get(member.id, 'name')}`)
        .then((mbr) => {
            client.log(`Changed the AFK nickname to ${mbr.nickname}`);
            client.enmap.people.push('afkMembers', member.id);
            client.enmap.people.set(member.id, true, 'afk');
            client.enmap.people.set(member.id, reason, 'reason');
        })
        // catch delete error
        .catch((error) => client.log(`Kon nickname niet veranderen omdat: ${error}`));
};

client.afk.clear = (member) => {
    // Set the nickname for this member.
    member
        .setNickname(client.enmap.people.get(member.id, 'name'))
        .then((mbr) => {
            client.log(`Changed the nickname back to ${mbr.nickname}`);
            client.enmap.people.remove('afkMembers', member.id);
            client.enmap.people.set(member.id, false, 'afk');
            client.enmap.people.set(member.id, '', 'reason');
        })
        // catch delete error
        .catch((error) => client.log(`Kon nickname niet veranderen omdat: ${error}`));
};