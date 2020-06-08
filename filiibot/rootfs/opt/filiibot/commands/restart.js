/*
 * If the command is 'restart'
 */
module.exports = {
  name: 'restart',
  description: 'Restart!',
  execute(message, _args) {
    if (!message.client.member.serverGod(message)) return;
    log('Restarting add-on');
    message.reply('rebooting bot...');

    supervisorRequest.post('addons/self/restart')
    .then((response) => {
        // handle success
        log(response.data);
        message.reply(response.data);
    })
    .catch((error) => {
        // handle error
        log(`Error: ${error}`);
    });
  },
};
