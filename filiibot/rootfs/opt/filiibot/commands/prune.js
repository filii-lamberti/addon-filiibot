/*
 * If the command is 'prune'
 * removes all messages from all users in the channel, up to 100.
 */
module.exports = {
  name: 'prune',
  description: 'Prune!',
  execute(message, args) {
    if (!message.client.member.praesidium(message)) return;

    // get the delete count, as an actual number.
    const amount = parseInt(args[0].toLowerCase(), 10) + 1;
    if (!amount || amount < 1 || amount > 99) {
      message.reply('geef een getal tussen 1 en 99 voor het aantal te verwijderen berichten.');
      return;
    }

    // delete the messages
    message.channel.bulkDelete(amount, true)
      .then((messages) => message.client.log(`Bulk deleted ${messages.size} messages`))
      // catch delete error
      .catch((error) => message.reply(`kon berichten niet verwijderen omdat: ${error}`));
  },
};
