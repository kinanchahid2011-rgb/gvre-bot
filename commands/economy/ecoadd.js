const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");
const {
  getUserRecord,
  updateUserRecord,
} = require("../../economy/economyutils");

const HR_ROLE_ID = "1481953102654607451"; // HR Staff role

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ecoadd")
    .setDescription("HR: Add money to a user's balance.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to give money to.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of money to add.")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    // HR role check
    if (!interaction.member.roles.cache.has(HR_ROLE_ID)) {
      return interaction.editReply({
        content: "❌ Only HR staff can use this command.",
        flags: 64,
      });
    }

    const hrMember = interaction.member;
    const receiver = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (amount <= 0) {
      return interaction.editReply({
        content: "❌ Amount must be greater than 0.",
        flags: 64,
      });
    }

    const receiverRecord = getUserRecord(receiver.id);

    receiverRecord.cash += amount;
    updateUserRecord(receiverRecord);

    const desc =
      `> <:shines:1524097104547680276> **Added to:** <@${receiver.id}>\n` +
      `> <:shines:1524097104547680276> **Amount:** $${amount}\n` +
      `> <:shines:1524097104547680276> **New Balance:** $${receiverRecord.cash}`;

    const { embed } = embedTemplate({
      title: "<:shines:1524097104547680276> Money Added <:shines:1524097104547680276>",
      description: desc,
      thumbnail: receiver.displayAvatarURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    await interaction.editReply({
      embeds: [embed],
      flags: 64,
    });

    try {
      await receiver.send({
        content:
          `💸 **You received money!**\n` +
          `> <:shines:1524097104547680276> **From:** ${hrMember.user.username} (HR)\n` +
          `> <:shines:1524097104547680276> **Amount:** $${amount}\n` +
          `> <:shines:1524097104547680276> **New Balance:** $${receiverRecord.cash}`,
      });
    } catch {}
  },
};
