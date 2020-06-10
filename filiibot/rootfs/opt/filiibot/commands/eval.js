/*
 * Used to test things, examples below
 * message.client.emit('guildMemberAdd', member);
 * message.client.emit('guildMemberRemove', member);
 * message.client.emit('guildCreate', message.guild);
 * message.client.emit('guildDelete', message.guild);
 */
const util = require('util');

const clean = (text) => {
  if (typeof text === 'string') {
    return text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`);
  }
  return text;
};

module.exports = {
  name: 'eval',
  description: 'Eval!',
  execute(message, args) {
    if (!message.client.member.serverGod(message)) return;

    try {
      // eslint-disable-next-line no-eval
      let evaled = eval(args.join(' '));

      if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled);
      }

      message.channel.send(clean(evaled), { code: 'xl' });
    } catch (error) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
    }
  },
};
