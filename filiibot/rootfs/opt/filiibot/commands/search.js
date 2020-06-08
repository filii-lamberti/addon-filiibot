/*
 * If the command is 'search'
 */
module.exports = {
  name: 'search',
  description: 'Dearch!',
  execute(message, _args) {
    message.reply(message.client.filiikot.statusMessage);
  },
};
