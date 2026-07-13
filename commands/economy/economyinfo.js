const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");
const { loadEconomy, loadRoleIncome } = require("../../economy/economyutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("economyinfo")
    .setDescription("View fun statistics about the server economy."),

  async execute(interaction) {
    await interaction.deferReply();

    // JSONBin → async
    const economy = await loadEconomy();
    const roleIncome = await loadRoleIncome();

    if (!economy.length) {
      const { embed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Economy Statistics <:shines:1524097104547680276>",
        description:
          "> <:bulletpoint:1524621721318195230> No economy data found.",
        color: 0xff4d4d,
      });
      return interaction.editReply({ embeds: [embed] });
    }

    // Total money
    const totalMoney = economy.reduce((sum, u) => sum + (u.cash ?? 0), 0);

    // Average balance
    const avgBalance = Math.round(totalMoney / economy.length);

    // Richest user
    const richest = economy.reduce(
      (max, u) => ((u.cash ?? 0) > (max.cash ?? 0) ? u : max),
      economy[0],
    );
    const richestMember = interaction.guild.members.cache.get(richest.userId);

    // Poorest user
    const poorest = economy.reduce(
      (min, u) => ((u.cash ?? 0) < (min.cash ?? 0) ? u : min),
      economy[0],
    );
    const poorestMember = interaction.guild.members.cache.get(poorest.userId);

    // Role income stats
    const roleEntries = Object.entries(roleIncome);
    const highestIncome = roleEntries.reduce(
      (max, r) => (r[1] > max[1] ? r : max),
      roleEntries[0],
    );
    const lowestIncome = roleEntries.reduce(
      (min, r) => (r[1] < min[1] ? r : min),
      roleEntries[0],
    );

    const highestRole = interaction.guild.roles.cache.get(highestIncome[0]);
    const lowestRole = interaction.guild.roles.cache.get(lowestIncome[0]);

    // Build description
    let desc = "";

    desc += `> <:bulletpoint:1524621721318195230> **Total Money in Circulation:** $${totalMoney}\n`;
    desc += `> <:bulletpoint:1524621721318195230> **Registered Users:** ${economy.length}\n`;
    desc += `> <:bulletpoint:1524621721318195230> **Average Balance:** $${avgBalance}\n\n`;

    desc += `> <:bulletpoint:1524621721318195230> **Richest User:** ${
      richestMember
        ? richestMember.user.username
        : `Unknown (${richest.userId})`
    } — $${richest.cash}\n`;

    desc += `> <:bulletpoint:1524621721318195230> **Poorest User:** ${
      poorestMember
        ? poorestMember.user.username
        : `Unknown (${poorest.userId})`
    } — $${poorest.cash}\n\n`;

    desc += `> <:bulletpoint:1524621721318195230> **Highest Role Income:** ${
      highestRole ? highestRole.name : highestIncome[0]
    } — $${highestIncome[1]}\n`;

    desc += `> <:bulletpoint:1524621721318195230> **Lowest Role Income:** ${
      lowestRole ? lowestRole.name : lowestIncome[0]
    } — $${lowestIncome[1]}\n`;

    const { embed } = embedTemplate({
      title:
        "<:shines:1524097104547680276> Economy Statistics <:shines:1524097104547680276>",
      description: desc,
      thumbnail: interaction.guild.iconURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
