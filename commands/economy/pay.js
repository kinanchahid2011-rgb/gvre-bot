const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");
const {
  getUserRecord,
  updateUserRecord,
} = require("../../economy/economyutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user money.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user you want to pay.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("amount")
        .setDescription("Amount to pay (number or 'all').")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const senderId = interaction.user.id;
    const receiver = interaction.options.getUser("user");
    const amountInput = interaction.options.getString("amount");

    if (receiver.id === senderId) {
      return interaction.editReply({
        content: "❌ You cannot pay yourself.",
        flags: 64,
      });
    }

    const sender = getUserRecord(senderId);
    const receiverRecord = getUserRecord(receiver.id);

    // Determine amount
    let amount;

    if (amountInput.toLowerCase() === "all") {
      amount = sender.cash;
    } else {
      amount = parseInt(amountInput);
      if (isNaN(amount)) {
        return interaction.editReply({
          content: "❌ Amount must be a number or 'all'.",
          flags: 64,
        });
      }
    }

    if (amount <= 0) {
      return interaction.editReply({
        content: "❌ Amount must be greater than 0.",
        flags: 64,
      });
    }

    if (sender.cash < amount) {
      return interaction.editReply({
        content: "❌ You do not have enough money to make this payment.",
        flags: 64,
      });
    }

    // Process payment
    sender.cash -= amount;
    receiverRecord.cash += amount;

    updateUserRecord(sender);
    updateUserRecord(receiverRecord);

    // Sender embed
    const desc =
      `> <:shines:1524097104547680276> **You paid:** <@${receiver.id}> $${amount}\n` +
      `> <:shines:1524097104547680276> **Your new balance:** $${sender.cash}`;

    const { embed } = embedTemplate({
      title: "<:shines:1524097104547680276> Payment Sent <:shines:1524097104547680276>",
      description: desc,
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    await interaction.editReply({
      embeds: [embed],
      flags: 64,
    });

    // DM the receiver
    try {
      await receiver.send({
        content:
          `💸 **You received a payment!**\n` +
          `> <:shines:1524097104547680276> **From:** ${interaction.user.username}\n` +
          `> <:shines:1524097104547680276> **Amount:** $${amount}\n` +
          `> <:shines:1524097104547680276> **New Balance:** $${receiverRecord.cash}`,
      });
    } catch {
      // Ignore if DMs are closed
    }
  },
};
