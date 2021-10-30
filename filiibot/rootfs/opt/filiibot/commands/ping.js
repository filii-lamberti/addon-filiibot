const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const sent = await interaction.reply({ content: 'Ping?', fetchReply: true });
		return interaction.editReply(
			`Websocket heartbeat: ${Math.round(client.ws.ping)}ms,
			roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`
		);	},
};
