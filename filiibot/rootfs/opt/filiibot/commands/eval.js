// Used to test things, examples below
// client.emit('guildMemberAdd', member);
// client.emit('guildMemberRemove', member);
// client.emit('guildCreate', message.guild);
// client.emit('guildDelete', message.guild);
case 'eval':
    if (!isMemberServerGod(message)) return;

    try {
    // eslint-disable-next-line no-eval
    let evaled = eval(args.slice(1).join(' '));

    if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled);
    }

    message.channel.send(clean(evaled), { code: 'xl' });
    } catch (error) {
    message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
    }
    break;