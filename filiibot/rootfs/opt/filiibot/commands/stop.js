/*
 * If the command is 'stop'
 */
// HTTP REST API
const axios = require('axios');

module.exports = {
  name: 'stop',
  description: 'Stop!',
  execute(message, _args) {
    if (!message.client.member.constructor.serverGod(message)) return;

    if (!message.client.config.supervisorToken) {
      message.reply('sorry, you need to run this as an add-on to use this!');
      return;
    }

    message.client.log('Stopping add-on');
    message.reply('shutting down...');

    // Supervisor REST API
    axios({
      url: 'http://supervisor/addons/self/stop',
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
