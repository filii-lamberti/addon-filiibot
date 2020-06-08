/*
 * If the command is 'api'
 */
module.exports = {
  name: 'api',
  description: 'Api!',
  execute(message, _args) {
    message.reply('the api command is removed.');
  },
};
