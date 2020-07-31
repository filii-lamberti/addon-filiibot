/*
 * If the command is 'restart'
 */
// HTTP REST API
const axios = require('axios');

module.exports = {
  name: 'restart',
  description: 'Restart!',
  execute(message, _args) {
    if (!message.client.member.serverGod(message)) return;

    if (!message.client.config.supervisorToken) {
      message.reply('sorry, you need to run this as an add-on to use this!');
      return;
    }

    message.client.log('Restarting add-on');
    message.reply('rebooting bot...');

    // Supervisor REST API
    axios({
      url: 'http://supervisor/addons/self/restart',
      method: 'post',
      headers: {
        Authorization: `Bearer ${message.client.config.supervisorToken}`,
        'Content-Type': 'application/json',
      },
    })
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
