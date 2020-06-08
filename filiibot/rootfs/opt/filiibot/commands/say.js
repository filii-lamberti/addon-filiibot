/*
 * If the command is 'say'
 * makes the bot say something and delete the message.
 */
module.exports = {
  name: 'say',
  description: 'Say!',
  execute(message, args) {
    if (!message.client.member.praesidium(message)) return;

    // We delete the original message
    message
    .delete()
    .then((msg) => log(`Deleted message from ${msg.member.displayName}`))
    // and catch the error
    .catch((error) => message.reply(`kon bericht niet verwijderen omdat: ${error}`));

    // And we get the bot to say the thing:
    message.channel.send(args.slice(1).join(' '));
  },
};
