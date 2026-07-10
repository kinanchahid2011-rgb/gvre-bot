const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const path = require("node:path");
const embedTemplate = require("../../utils/embedTemplate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Submit a suggestion to GVRE.")
    .addStringOption((option) =>
      option
        .setName("suggestion")
        .setDescription("Your suggestion for GVRE.")
        .setRequired(true)
    ),

  async execute(interaction) {
    const suggestionChannelId = "1495054021348687935"; // #suggestions channel
    const hrRoleId = "1481953102654607451"; // HR role

    const suggestionChannel = interaction.guild.channels.cache.get(suggestionChannelId);

    if (!suggestionChannel) {
      return interaction.reply({
        content: "Suggestion channel not found.",
        flags: 64,
      });
    }

    const suggestion = interaction.options.getString("suggestion");
    const user = interaction.user;

    // Create suggestion embed
    const { embed, files } = embedTemplate({
      title: "<:shines:1524097104547680276> New Suggestion <:shines:1524097104547680276>",
      description:
        `> <a:startilt:1524621292790222989> **Suggested By:** ${user} (${user.id})\n\n` +
        `> <a:startilt:1524621292790222989> **Suggestion:**\n${suggestion}`,
      thumbnail: user.displayAvatarURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    // Send to suggestion channel + ping HR
    const msg = await suggestionChannel.send({
      content: `<@&${hrRoleId}>`,
      embeds: [embed],
      files,
    });

    // Add yes/no reactions
    await msg.react("1523981318935810139"); // <:yes:1523981318935810139>
    await msg.react("1525174580455673987"); // <:no:1525174580455673987>

    // Acknowledge to user
    await interaction.reply({
      content: "💡 Your suggestion has been submitted!",
      flags: 64,
    });
  },
};
