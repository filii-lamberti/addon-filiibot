case 'stop':
    if (!isMemberServerGod(message)) return;
    log('Stopping add-on');
    message.reply('shutting down...');

    supervisorRequest.post('addons/self/stop')
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