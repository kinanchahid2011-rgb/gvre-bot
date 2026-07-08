const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete a number of messages, excluding pinned ones")
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const staffRoleId = "1481953107448692860"; // Staff role ID

    // Permission check
    if (!interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: 64
      });
    }

    const amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "Amount must be between **1** and **100**.",
        flags: 64
      });
    }

    await interaction.deferReply({ flags: 64 });

    // Fetch messages
    const fetched = await interaction.channel.messages.fetch({ limit: amount });

    // Filter out pinned messages
    const toDelete = fetched.filter(msg => !msg.pinned);

    if (toDelete.size === 0) {
      return interaction.editReply({
        content: "No unpinned messages found to delete."
      });
    }

    // Bulk delete
    await interaction.channel.bulkDelete(toDelete, true);

    await interaction.editReply({
      content: `Successfully deleted **${toDelete.size}** messages (excluding pinned).`
    });
  }
};
