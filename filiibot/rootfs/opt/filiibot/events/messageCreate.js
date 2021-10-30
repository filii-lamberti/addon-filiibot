/*
 * This event will run on every single message received, from any channel or DM.
 */

module.exports = {
  name: 'messageCreate',
  description: 'This event will run on every single message received, from any channel or DM.',
  execute(client, message) {
    // Ignore all bots
    if (message.author.bot) return;
    // Store the original trimmed content of the message
    const content = message.content.trim();

    /*
    // Check is the author of the message is AFK
    const afkMembers = this.client.enmap.get('afkMembers');
    if (afkMembers.includes(message.author.id)) {
      this.client.afk.clear(message.member);
    }

    const mentionedAfkMembers = afkMembers
      .filter((element) => message.mentions.members.has(element));
    mentionedAfkMembers.forEach((element) => {
      message.reply(
        `${this.client.enmap.get(element, 'name')} is momenteel AFK
        met als reden: "${this.client.enmap.get(element, 'reason')}".`,
      );
    });
    */
    
    // Regex to check if the message starts with ik ben or kben
    const regexBen = /^i?k\s*ben\s+/im;
    // Test if the message starts with ik ben or kben
    if (regexBen.test(content)) {
      // Reply but replace the beginning of the message with 'Dag ..., ik ben de Filiibot!'
      message.channel.send(
        `Dag ${content.replace(regexBen, '')}, ik ben de Filiibot!`,
      );
    }

    // Regex to check is the message contains 12, dozijn or twaalf
    const regexTwaalf = /\b(1 ?2|d ?o ?z ?i ?j ?n|t ?w ?a ?a ?l ?f)\b/i;
    // Test if the message contains 12, dozijn or twaalf
    if (regexTwaalf.test(content)) {
      // Reply with 'twaalf is zekerheid'
      message.reply('twaalf is zekerheid');
    }

    // If the message is a DM
    // if(command.guildOnly && message.channel.type !== 'text') {
    if (message.channel.type === 'dm') {
      // Reply with 'I can\'t execute that command inside DMs!'
      message.reply(
        `Het spijt me zeer, maar ik ben momenteel niet geïnteresseerd in persoonlijke relaties.
        Ik heb mijn handen al vol met Filii te dienen!`,
      );
    }
