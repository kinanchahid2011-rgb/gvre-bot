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
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove money from.")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Amount of money to remove.")
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    // HR role check
    if (!interaction.member.roles.cache.has(HR_ROLE_ID)) {
      const { embed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Access Denied <:shines:1524097104547680276>",
        description:
          "> <:bulletpoint:1524621721318195230> Only HR staff can use this command.",
        color: 0xff4d4d,
      });
      return interaction.editReply({ embeds: [embed] });
    }

    const hrMember = interaction.member;
    const receiver = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (amount <= 0) {
      const { embed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Invalid Amount <:shines:1524097104547680276>",
        description:
          "> <:bulletpoint:1524621721318195230> Amount must be greater than 0.",
        color: 0xff4d4d,
      });
      return interaction.editReply({ embeds: [embed] });
    }

    // JSONBin → async
    const receiverRecord = await getUserRecord(receiver.id);

    // Safety default
    receiverRecord.cash = receiverRecord.cash ?? 0;

    if (receiverRecord.cash < amount) {
      const { embed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Insufficient Funds <:shines:1524097104547680276>",
        description:
          "> <:bulletpoint:1524621721318195230> That user does not have enough money.",
        color: 0xff4d4d,
      });
      return interaction.editReply({ embeds: [embed] });
    }

    // Remove money
    receiverRecord.cash -= amount;
    await updateUserRecord(receiverRecord);

    // HR confirmation embed
    const desc =
      `> <:bulletpoint:1524621721318195230> **Removed from:** <@${receiver.id}>\n` +
      `> <:bulletpoint:1524621721318195230> **Amount:** $${amount}\n` +
      `> <:bulletpoint:1524621721318195230> **New Balance:** $${receiverRecord.cash}`;

    const { embed } = embedTemplate({
      title:
        "<:shines:1524097104547680276> Money Removed <:shines:1524097104547680276>",
      description: desc,
      thumbnail: receiver.displayAvatarURL({ dynamic: true }),
      color: 0xff4d4d,
    });

    await interaction.editReply({ embeds: [embed] });

    // DM the user with embed
    try {
      const { embed: dmEmbed } = embedTemplate({
        title:
          "<:shines:1524097104547680276> Money Removed <:shines:1524097104547680276>",
        description:
          `> <:bulletpoint:1524621721318195230> **By:** ${hrMember.user.username} (HR)\n` +
          `> <:bulletpoint:1524621721318195230> **Amount Removed:** $${amount}\n` +
          `> <:bulletpoint:1524621721318195230> **New Balance:** $${receiverRecord.cash}`,
        color: 0xff4d4d,
      });
      await receiver.send({ embeds: [dmEmbed] });
    } catch {
      // Ignore if DMs are closed
    }
  },
};
