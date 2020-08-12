module.exports = {
  name: 'pause',
  description: 'Pause command.',
  cooldown: 5,
  execute(message) {
    if (!message.member.voice.channel) {
      message.channel.send('❌ You are not in a voice channel!');
      return;
    }
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) {
      message.channel.send('❌ There is nothing playing right now!');
      return;
    }
    if (!serverQueue.playing) {
      message.channel.send('❌ The player is already paused!');
      return;
    }
    serverQueue.playing = false;
    serverQueue.connection.dispatcher.pause(true);
    message.channel.send('⏸ The player has been paused!');
  },
};
