const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get info about a user or a server!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Info about a user')
                .addUserOption(option => option.setName('target').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Info about the server')),
    async execute(interaction) {

        if (interaction.options.getSubcommand() === 'moderation_logs') {
            const user = interaction.options.getChannel('logging_channel');
        }
        return interaction.reply(`Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`);
    },
};