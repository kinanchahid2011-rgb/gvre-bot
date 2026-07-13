const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");
const { loadEconomy, loadRoleIncome } = require("../../economy/economyutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("economyinfo")
    .setDescription("View fun statistics about the server economy."),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const economy = loadEconomy();
    const roleIncome = loadRoleIncome();

    if (!economy.length) {
      return interaction.editReply({
        content: "📉 No economy data found.",
        flags: 64,
      });
    }

    // Total money
    const totalMoney = economy.reduce((sum, u) => sum + u.cash, 0);

    // Average balance
    const avgBalance = Math.round(totalMoney / economy.length);

    // Richest user
    const richest = economy.reduce((max, u) => (u.cash > max.cash ? u : max), economy[0]);
    const richestMember = interaction.guild.members.cache.get(richest.userId);

    // Poorest user
    const poorest = economy.reduce((min, u) => (u.cash < min.cash ? u : min), economy[0]);
    const poorestMember = interaction.guild.members.cache.get(poorest.userId);

    // Role income stats
    const roleEntries = Object.entries(roleIncome);
    const highestIncome = roleEntries.reduce((max, r) => (r[1] > max[1] ? r : max), roleEntries[0]);
    const lowestIncome = roleEntries.reduce((min, r) => (r[1] < min[1] ? r : min), roleEntries[0]);

    const highestRole = interaction.guild.roles.cache.get(highestIncome[0]);
    const lowestRole = interaction.guild.roles.cache.get(lowestIncome[0]);

    // Build description
    let desc = "";

    desc += `> <:shines:1524097104547680276> **Total Money in Circulation:** $${totalMoney}\n`;
    desc += `> <:shines:1524097104547680276> **Registered Users:** ${economy.length}\n`;
    desc += `> <:shines:1524097104547680276> **Average Balance:** $${avgBalance}\n\n`;

    desc += `> <:shines:1524097104547680276> **Richest User:** ${
      richestMember ? richestMember.user.username : `Unknown (${richest.userId})`
    } — $${richest.cash}\n`;

    desc += `> <:shines:1524097104547680276> **Poorest User:** ${
      poorestMember ? poorestMember.user.username : `Unknown (${poorest.userId})`
    } — $${poorest.cash}\n\n`;

    desc += `> <:shines:1524097104547680276> **Highest Role Income:** ${
      highestRole ? highestRole.name : highestIncome[0]
    } — $${highestIncome[1]}\n`;

    desc += `> <:shines:1524097104547680276> **Lowest Role Income:** ${
      lowestRole ? lowestRole.name : lowestIncome[0]
    } — $${lowestIncome[1]}\n`;

    const { embed } = embedTemplate({
      title: "<:shines:1524097104547680276> Economy Statistics <:shines:1524097104547680276>",
      description: desc,
      thumbnail: interaction.guild.iconURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    await interaction.editReply({
      embeds: [embed],
      flags: 64,
    });
  },
};
