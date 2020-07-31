class SuperMember {
  constructor(client) {
    this.client = client;
  }

  // Is the message author part of Praesidium?
  static praesidium(message) {
    if (message.member.roles.cache.get('239827955558121473')) return true;
    message.reply('sorry, you need to be Praesidium to use this!');
    return false;
  }

  // Is the message author a Server God?
  static serverGod(message) {
    if (message.member.roles.cache.get('240103009944731648')) return true;
    message.reply('sorry, you need to be a Server God to use this!');
    return false;
  }

  // Was there a member mentioned?
  static which(message) {
    if (message.mentions.members.size === 0) {
      // Use the person who made the command
      return message.member;
    }
    // Use the person you mentioned
    return message.mentions.members.first();
  }
}

module.exports = SuperMember;
