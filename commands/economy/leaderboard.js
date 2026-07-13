const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");
const path = require("node:path");
const { loadEconomy } = require("../../economy/economyutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the top richest players."),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const economy = loadEconomy();

    if (!economy.length) {
      return interaction.editReply({
        content: "📉 No economy data found.",
        flags: 64,
      });
    }

    // Sort by cash descending
    const sorted = economy.sort((a, b) => b.cash - a.cash);

    // Top 10
    const top = sorted.slice(0, 10);

    let desc = "";

    top.forEach((user, index) => {
      const member = interaction.guild.members.cache.get(user.userId);
      const name = member ? member.user.username : `Unknown User (${user.userId})`;

      desc += `> **#${index + 1}** — ${name}: $${user.cash}\n`;
    });

    const { embed } = embedTemplate({
      title: "<:shines:1524097104547680276> Economy Leaderboard <:shines:1524097104547680276>",
      description: desc,
      color: 0x3cf65b,
      thumbnail: interaction.guild.iconURL({ dynamic: true }),
    });

    await interaction.editReply({
      embeds: [embed],
      flags: 64,
    });
  },
};
