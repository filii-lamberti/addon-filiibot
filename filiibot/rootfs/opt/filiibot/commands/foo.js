/*
 * If the command is 'foo'
 */
module.exports = {
  name: 'foo',
  description: 'Foo!',
  execute(message, args) {
    message.channel.send('bar!');
  }
};