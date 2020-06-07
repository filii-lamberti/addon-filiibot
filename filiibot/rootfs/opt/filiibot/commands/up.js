case 'up':
    message.channel.send(
    `Uptime is ${humanizeDuration(client.uptime, {
        language: 'nl',
        conjunction: ' en ',
        serialComma: false,
        round: true,
    })}.`,
    );
    break;