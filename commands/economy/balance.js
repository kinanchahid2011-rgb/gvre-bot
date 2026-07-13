const { SlashCommandBuilder } = require("discord.js");
const path = require("node:path");
const embedTemplate = require("../../utils/embedTemplate");
const { getUserRecord } = require("../../economy/economyutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your current cash balance."),

  async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const user = getUserRecord(userId);

    // Build embed
    let desc = "";
    desc += `> <:gvreasterisk:1524624524849582101> **Current Balance:** $${user.cash}\n`;
    desc += `> <:gvreasterisk:1524624524849582101> **Last Collected:** ${
      user.lastCollect
        ? `<t:${user.lastCollect}:R>`
        : "Never collected"
    }`;

    const { embed, files } = embedTemplate({
      title: "<:shines:1524097104547680276> Your Balance <:shines:1524097104547680276>",
      description: desc,
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    await interaction.editReply({
      embeds: [embed],
      files,
    });
  },
};
