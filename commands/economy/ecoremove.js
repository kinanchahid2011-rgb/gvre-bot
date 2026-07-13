const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");
const {
  getUserRecord,
  updateUserRecord,
} = require("../../economy/economyutils");

const HR_ROLE_ID = "1481953102654607451"; // HR Staff role

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ecoremove")
    .setDescription("HR: Remove money from a user's balance.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to remove money from.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Amount of money to remove.")
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

    if (receiverRecord.cash < amount) {
      return interaction.editReply({
        content: "❌ That user does not have enough money.",
        flags: 64,
      });
    }

    // Remove money
    receiverRecord.cash -= amount;
    updateUserRecord(receiverRecord);

    // HR confirmation embed
    const desc =
      `> <:shines:1524097104547680276> **Removed from:** <@${receiver.id}>\n` +
      `> <:shines:1524097104547680276> **Amount:** $${amount}\n` +
      `> <:shines:1524097104547680276> **New Balance:** $${receiverRecord.cash}`;

    const { embed } = embedTemplate({
      title: "<:shines:1524097104547680276> Money Removed <:shines:1524097104547680276>",
      description: desc,
      thumbnail: receiver.displayAvatarURL({ dynamic: true }),
      color: 0xff4d4d, // red tone for removal
    });

    await interaction.editReply({
      embeds: [embed],
      flags: 64,
    });

    // DM the user
    try {
      await receiver.send({
        content:
          `⚠️ **Money Removed From Your Account**\n` +
          `> <:shines:1524097104547680276> **By:** ${hrMember.user.username} (HR)\n` +
          `> <:shines:1524097104547680276> **Amount Removed:** $${amount}\n` +
          `> <:shines:1524097104547680276> **New Balance:** $${receiverRecord.cash}`,
      });
    } catch {
      // Ignore if DMs are closed
    }
  },
};
