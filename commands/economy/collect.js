const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");
const {
  loadRoleIncome,
  getUserRecord,
  updateUserRecord,
} = require("../../economy/economyutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("collect")
    .setDescription("Collect your role-based income.")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction) {
    await interaction.deferReply();

    const member = interaction.member;
    const userId = interaction.user.id;

    const roleIncome = await loadRoleIncome();
    const user = await getUserRecord(userId);

    const now = Date.now();
    const cooldownMs = 60 * 60 * 1000; // 1 hour

    // -----------------------------------------------------
    // COOLDOWN → EPHEMERAL
    // -----------------------------------------------------
    if (user.lastCollect && now - user.lastCollect < cooldownMs) {
      const remaining = cooldownMs - (now - user.lastCollect);

      const { embed, files } = embedTemplate({
        title: "⏳ Cooldown Active",
        description: `You already collected.\nTry again <t:${Math.floor((now + remaining) / 1000)}:R>.`,
        color: 0xffcc00,
      });

      return interaction.editReply({
        embeds: [embed],
        files,
        flags: 64, // ephemeral
      });
    }

    // -----------------------------------------------------
    // CALCULATE INCOME
    // -----------------------------------------------------
    let totalIncome = 0;
    const earnedFrom = [];

    for (const [roleId, amount] of Object.entries(roleIncome)) {
      if (member.roles.cache.has(roleId)) {
        totalIncome += amount;
        earnedFrom.push({ roleId, amount });
      }
    }

    // -----------------------------------------------------
    // NO INCOME ROLES → EPHEMERAL
    // -----------------------------------------------------
    if (totalIncome === 0) {
      return interaction.editReply({
        content: "❌ You don't have any income-eligible roles.",
        flags: 64, // ephemeral
      });
    }

    // -----------------------------------------------------
    // SUCCESSFUL COLLECT → PUBLIC
    // -----------------------------------------------------
    user.cash = (user.cash ?? 0) + totalIncome;
    user.lastCollect = now;
    await updateUserRecord(user);

    let desc = "";
    desc += `> <:gvreasterisk:1524624524849582101> **Total Collected:** $${totalIncome}\n`;
    desc += `> <:gvreasterisk:1524624524849582101> **New Balance:** $${user.cash}\n\n`;
    desc += `> <:gvreasterisk:1524624524849582101> **Income Breakdown:**\n`;

    for (const entry of earnedFrom) {
      const role = interaction.guild.roles.cache.get(entry.roleId);
      const roleName = role ? role.name : `Unknown (${entry.roleId})`;
      desc += `> • ${roleName}: $${entry.amount}\n`;
    }

    const { embed, files } = embedTemplate({
      title:
        "<:shines:1524097104547680276> Income Collected <:shines:1524097104547680276>",
      description: desc,
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    return interaction.editReply({
      embeds: [embed],
      files,
    });
  },
};
