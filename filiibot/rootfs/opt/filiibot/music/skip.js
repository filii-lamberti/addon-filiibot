module.exports = {
  name: 'skip',
  description: 'Skip command.',
  cooldown: 5,
  execute(message) {
    const { channel } = message.member.voice;
    if (!channel) {
      message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
      return;
    }
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) {
      message.channel.send('There is nothing playing that I could skip for you.');
      return;
    }
    serverQueue.connection.dispatcher.end('Skip command has been used!');
  },
};
