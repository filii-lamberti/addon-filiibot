/*
 * If the command is 'up'
 */
const humanizeDuration = require('humanize-duration');

module.exports = {
  name: 'up',
  description: 'Up!',
  execute(message, _args) {
    message.channel.send(
      `Uptime is ${humanizeDuration(message.client.uptime, {
        language: 'nl',
        conjunction: ' en ',
        serialComma: false,
        round: true,
      })}.`,
    );
  },
};
