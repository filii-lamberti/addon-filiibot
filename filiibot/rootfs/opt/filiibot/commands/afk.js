/*
 * If the command is 'afk'
 */
module.exports = {
  name: 'afk',
  description: 'Afk!',
  execute(message, args) {
    message.client.afk.set(message.member, args.slice(1).join(' '));
  },
};
