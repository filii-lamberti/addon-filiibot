/*
 * If the command is 'purge'
 */
module.exports = {
  name: 'purge',
  description: 'Purge!',
  execute(message, _args) {
    message.reply('purge is obsolete, use the prune command instead.');
  },
};
