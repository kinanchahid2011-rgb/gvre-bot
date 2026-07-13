const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");
const { loadEconomy } = require("../../economy/economyutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the top richest players."),

  async execute(interaction) {
    await interaction.deferReply();

    // JSONBin → async
    const economy = await loadEconomy();

    if (!economy.length) {
      const { embed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Economy Leaderboard <:shines:1524097104547680276>",
        description:
          "> <:bulletpoint:1524621721318195230> No economy data found.",
        color: 0xff4d4d,
      });
      return interaction.editReply({ embeds: [embed] });
    }

    // Sort by cash descending (safe default)
    const sorted = economy.sort((a, b) => (b.cash ?? 0) - (a.cash ?? 0));

    // Top 10
    const top = sorted.slice(0, 10);

    let desc = "";

    top.forEach((user, index) => {
      const member = interaction.guild.members.cache.get(user.userId);
      const name = member
        ? member.user.username
        : `Unknown User (${user.userId})`;

      desc += `> <:bulletpoint:1524621721318195230> **#${index + 1}** — ${name}: $${user.cash ?? 0}\n`;
    });

    const { embed } = embedTemplate({
      title:
        "<:shines:1524097104547680276> Economy Leaderboard <:shines:1524097104547680276>",
      description: desc,
      color: 0x3cf65b,
      thumbnail: interaction.guild.iconURL({ dynamic: true }),
    });

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
