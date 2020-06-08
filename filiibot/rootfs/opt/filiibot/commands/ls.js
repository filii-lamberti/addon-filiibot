/*
 * If the command is 'ls'
 */
module.exports = {
  name: 'ls',
  description: 'Ls!',
  execute(message, _args) {
    let bericht;
    if (client.filiikot.people === '0') {
        bericht = 'er is momenteel niemand aanwezig.';
    } else {
    bericht = 'aanwezig:';
    client.filiikot.peopleNames.forEach((name) => {
        bericht += `\n- ${name}`;
    });
    }
    message.reply(bericht)
    .then((msg) => {
        // We delete the original message,
        message.delete({ timeout: 10000 });
        // the one we sent
        msg.delete({ timeout: 10000 });
    })
    // and catch the error
    .catch((err) => message.reply(`kon bericht niet verwijderen omdat: ${err}`));
  },
};
