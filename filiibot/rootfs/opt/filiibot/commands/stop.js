/*
 * If the command is 'stop'
 */
module.exports = {
  name: 'stop',
  description: 'Stop!',
  execute(message, _args) {
    if (!message.client.member.serverGod(message)) return;
    message.client.log('Stopping add-on');
    message.reply('shutting down...');

    message.client.supervisorRequest.post('addons/self/stop')
      .then((response) => {
        // handle success
        message.client.log(response.data);
        message.reply(response.data);
      })
      .catch((error) => {
        // handle error
        message.client.log(`Error: ${error}`);
      });
  },
};
