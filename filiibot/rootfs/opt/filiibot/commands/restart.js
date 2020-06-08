/*
 * If the command is 'restart'
 */
module.exports = {
  name: 'restart',
  description: 'Restart!',
  execute(message, _args) {
    if (!message.client.member.serverGod(message)) return;
    message.client.log('Restarting add-on');
    message.reply('rebooting bot...');

    message.client.supervisorRequest .post('addons/self/restart')
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
