/*
 * If the command is 'up'
 */
const humanizeDuration = require('humanize-duration');
// Set the locale to dutch
moment.locale('nl');

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
