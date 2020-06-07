/*
 * If the command is 'foo'
 */
module.exports = {
  name: 'foo',
  description: 'Foo!',
  execute(message, _args) {
    message.channel.send('bar!');
  },
};
