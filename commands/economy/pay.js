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
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to pay.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount to pay (number or 'all').")
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const senderId = interaction.user.id;
    const receiver = interaction.options.getUser("user");
    const amountInput = interaction.options.getString("amount");

    if (receiver.id === senderId) {
      const { embed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Payment Error <:shines:1524097104547680276>",
        description:
          "> <:bulletpoint:1524621721318195230> You cannot pay yourself.",
        color: 0xff4d4d,
      });
      return interaction.editReply({ embeds: [embed] });
    }

    // JSONBin → async
    const sender = await getUserRecord(senderId);
    const receiverRecord = await getUserRecord(receiver.id);

    // Safety defaults
    sender.cash = sender.cash ?? 0;
    receiverRecord.cash = receiverRecord.cash ?? 0;

    // Determine amount
    let amount;

    if (amountInput.toLowerCase() === "all") {
      amount = sender.cash;
    } else {
      amount = parseInt(amountInput);
      if (isNaN(amount)) {
        const { embed } = embedTemplate({
          title:
            "<:shines:1524097104547680276> Payment Error <:shines:1524097104547680276>",
          description:
            "> <:bulletpoint:1524621721318195230> Amount must be a number or 'all'.",
          color: 0xff4d4d,
        });
        return interaction.editReply({ embeds: [embed] });
      }
    }

    if (amount <= 0) {
      const { embed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Payment Error <:shines:1524097104547680276>",
        description:
          "> <:bulletpoint:1524621721318195230> Amount must be greater than 0.",
        color: 0xff4d4d,
      });
      return interaction.editReply({ embeds: [embed] });
    }

    if (sender.cash < amount) {
      const { embed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Payment Error <:shines:1524097104547680276>",
        description:
          "> <:bulletpoint:1524621721318195230> You do not have enough money to make this payment.",
        color: 0xff4d4d,
      });
      return interaction.editReply({ embeds: [embed] });
    }

    // Process payment
    sender.cash -= amount;
    receiverRecord.cash += amount;

    await updateUserRecord(sender);
    await updateUserRecord(receiverRecord);

    // Sender embed
    const desc =
      `> <:bulletpoint:1524621721318195230> **You paid:** <@${receiver.id}> $${amount}\n` +
      `> <:bulletpoint:1524621721318195230> **Your new balance:** $${sender.cash}`;

    const { embed } = embedTemplate({
      title:
        "<:shines:1524097104547680276> Payment Sent <:shines:1524097104547680276>",
      description: desc,
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    await interaction.editReply({ embeds: [embed] });

    // DM the receiver with embed
    try {
      const { embed: dmEmbed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Payment Received <:shines:1524097104547680276>",
        description:
          `> <:bulletpoint:1524621721318195230> **From:** ${interaction.user.username}\n` +
          `> <:bulletpoint:1524621721318195230> **Amount:** $${amount}\n` +
          `> <:bulletpoint:1524621721318195230> **New Balance:** $${receiverRecord.cash}`,
        color: 0x3cf65b,
      });
      await receiver.send({ embeds: [dmEmbed] });
    } catch {
      // Ignore if DMs are closed
    }
  },
};
