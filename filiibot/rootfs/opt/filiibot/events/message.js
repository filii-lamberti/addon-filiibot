/*
 * This event will run on every single message received, from any channel or DM.
 */
const { Collection } = require('discord.js');

class Message {
  constructor(client) {
    this.client = client;
  }

  async on(message) {
    // Negeren als het bericht van een bot komt
    if (message.author.bot) return;
    // Store the original (trimmed) message
    const messageTrimmed = message.content.trim();

    this.checkAfk(message);
    this.checkBen(message, messageTrimmed);
    this.checkTwaalf(message, messageTrimmed);

    // Otherwise check if the prefix is there
    if (!messageTrimmed.startsWith(this.client.config.prefix)) return;
    // Remove the prefix from the message, trim it and split on spaces
    const args = messageTrimmed.slice(this.client.config.prefix.length).trim().split(/\s+/g);

    const commandName = args.shift().toLowerCase();
    const command = this.client.commands.get(commandName)
      || this.client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // Negeren als het een DM is
    if (command.guildOnly && message.channel.type !== 'text') {
      // Het spijt me zeer, maar ik ben momenteel niet geïnteresseerd in persoonlijke relaties.
      // Ik heb mijn handen al vol met Filii te dienen!
      message.reply('I can\'t execute that command inside DMs!');
      return;
    }

    if (command.args && !args.length) {
      let reply = `You didn't provide any arguments, ${message.author}!`;
      if (command.usage) {
        reply += `\nThe proper usage would be: \`${this.client.config.prefix}${command.name} ${command.usage}\``;
      }
      message.channel.send(reply);
      return;
    }

    if (!this.client.cooldowns.has(command.name)) {
      this.client.cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = this.client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        return;
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
      command.execute(message, args);
    } catch (error) {
      this.client.log(error);
      message.reply('there was an error trying to execute that command!');
    }
  }

  checkAfk(message) {
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
  }

  static checkBen(message, messageTrimmed) {
    // ik ben of kben of... at the beginning
    const regexBen = /^i?k\s*ben\s+/im;
    // test het bericht op regexBen
    if (regexBen.test(messageTrimmed)) {
      // reply but replace the beginning
      message.channel.send(
        `Dag ${messageTrimmed.replace(regexBen, '')}, ik ben de Filiibot!`,
      );
    }
  }

  static checkTwaalf(message, messageTrimmed) {
    // 12 of twaalf of dozijn als woord
    const regexTwaalf = /\b(1 ?2|t ?w ?a ?a ?l ?f|d ?o ?z ?i ?j ?n)\b/i;
    // test het bericht op regexTwaalf
    if (regexTwaalf.test(messageTrimmed)) {
      message.reply('twaalf is zekerheid!');
    }
  }
}

module.exports = Message;
