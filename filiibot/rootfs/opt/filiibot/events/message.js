/*
 * This event will run on every single message received, from any channel or DM.
 */
class Message {
  constructor(client) {
    this.client = client;
  }

  async on(message) {
    // Negeren als het bericht van een bot komt
    if (message.author.bot) return;
    // Store the original message
    const messageTrimmed = message.content.trim();

    const afkMembers = message.client.enmap.people.get('afkMembers');
    if (afkMembers.includes(message.author.id)) {
      message.client.afk.clear(message.member);
    }

    const mentionedAfkMembers = afkMembers.filter((element) => message.mentions.members.has(element));
    mentionedAfkMembers.forEach((element) => {
      message.reply(
        `${message.client.enmap.people.get(element, 'name')} is momenteel AFK
        met als reden: "${message.client.enmap.people.get(element, 'reason')}".`,
      );
    });

    // ik ben of kben of... at the beginning
    const regexBen = /^i?k\s*ben\s+/im;
    // test het bericht op regexBen
    if (regexBen.test(messageTrimmed)) {
      // reply but replace the beginning
      message.channel.send(
        `Dag ${messageTrimmed.replace(regexBen, '')}, ik ben de Filiibot!`,
      );
    }

    // 12 of twaalf of dozijn als woord
    const regexTwaalf = /\b(1 ?2|t ?w ?a ?a ?l ?f|d ?o ?z ?i ?j ?n)\b/i;
    // test het bericht op regexTwaalf
    if (regexTwaalf.test(messageTrimmed)) {
      message.reply('twaalf is zekerheid!');
    }

    // Otherwise check if the prefix is there
    if (!messageTrimmed.startsWith(message.client.config.prefix)) return;
    // Remove the prefix from the message
    const messageSliced = messageTrimmed.slice(message.client.config.prefix.length);
    // To get the "message" itself we join the array back into a string with spaces
    const args = messageSliced.split(/\s+/g);

    const commandName = args.shift().toLowerCase();
    if (!message.client.commands.has(commandName)) return;
    const command = message.client.commands.get(commandName);
    // Negeren als het een DM is
    if (command.guildOnly && message.channel.type !== 'text') {
      message.reply(
        'Het spijt me zeer, maar ik ben momenteel niet geïnteresseerd in persoonlijke relaties. Ik heb mijn handen al vol met Filii te dienen!',
      );
      return;
    }
    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${message.client.config.prefix}${command.name} ${command.usage}\``;
      }
      message.channel.send(reply);
      return;
    }
    try {
      command.execute(message, args);
    } catch (error) {
      message.client.log(error);
      message.reply('there was an error trying to execute that command!');
    }
  }
}

module.exports = Message;
