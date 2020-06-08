/*
 * If the command is 'welcome'
 */
module.exports = {
  name: 'welcome',
  description: 'Welcome!',
  execute(message, _args) {
    message.reply('de welkomsttekst is opnieuw naar je gestuurd.');
    message.member.send(welcomeDm);
  },
};
