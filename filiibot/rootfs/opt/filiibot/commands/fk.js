/*
 * If the command is 'fk'
 */
module.exports = {
  name: 'fk',
  description: 'Fk!',
  execute(message, _args) {
    message.reply(message.client.filiikot.statusMessage);
  },
};
