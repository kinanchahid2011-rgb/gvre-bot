const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Make the bot repeat what you say")
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message you want the bot to say")
                .setRequired(true)
        ),

    async execute(interaction) {
        const message = interaction.options.getString("message");

        // Confirm privately
        await interaction.reply({
            content: "Message sent.",
            flags: 64
        });

        // Send the actual message
        await interaction.channel.send({
            content: message
        });
    }
};
