/*
 * If the command is 'up'
 */
module.exports = {
  name: 'up',
  description: 'Up!',
  execute(message, _args) {
    message.channel.send(
    `Uptime is ${humanizeDuration(client.uptime, {
        language: 'nl',
        conjunction: ' en ',
        serialComma: false,
        round: true,
    })}.`,
    );
  },
};
