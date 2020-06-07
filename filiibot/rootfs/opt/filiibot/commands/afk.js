
// If the command is 'afk'
case 'afk':
    // message.reply('sorry, maar dit kan ik nog niet.');
    message.client.afk.set(message.member, args.slice(1).join(' '));
    break;