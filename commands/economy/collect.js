const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const path = require("node:path");
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

    const roleIncome = loadRoleIncome();
    const user = getUserRecord(userId);

    // Optional cooldown (once per day)
    const now = Math.floor(Date.now() / 1000);
    const cooldownSeconds = 60 * 60;

    if (user.lastCollect && now - user.lastCollect < cooldownSeconds) {
      const remaining = cooldownSeconds - (now - user.lastCollect);
      return interaction.editReply({
        content: `⏳ You already collected. Try again <t:${now + remaining}:R>.`,
        flags: 64,
      });
    }

    // Calculate total income based on roles
    let totalIncome = 0;
    const earnedFrom = [];

    for (const [roleId, amount] of Object.entries(roleIncome)) {
      if (member.roles.cache.has(roleId)) {
        totalIncome += amount;
        earnedFrom.push({ roleId, amount });
      }
    }

    if (totalIncome === 0) {
      return interaction.editReply({
        content: "❌ You don't have any income-eligible roles.",
        flags: 64,
      });
    }

    // Update user balance
    user.cash += totalIncome;
    user.lastCollect = now;
    updateUserRecord(user);

    // Build embed description
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
      title: "<:shines:1524097104547680276> Income Collected <:shines:1524097104547680276>",
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