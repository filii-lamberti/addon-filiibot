// If the command is 'restart'
case 'restart':
    if (!isMemberServerGod(message)) return;
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
    break;