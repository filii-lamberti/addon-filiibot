/*
 * If the command is 'version'
 */
const { version } = require('../package.json');

module.exports = {
  name: 'version',
  description: 'Version!',
  execute(message, _args) {
    message.channel.send(`Currently running v${version}.`);
  },
};
