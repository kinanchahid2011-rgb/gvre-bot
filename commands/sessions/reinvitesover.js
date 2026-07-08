const { SlashCommandBuilder } = require("discord.js");
const path = require("node:path");
const embedTemplate = require("../../utils/embedTemplate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reinvitesover")
    .setDescription("End the reinvites phase and announce completion"),

  async execute(interaction) {
    const staffRoleId = "1481953107448692860"; // Staff role

    // Permission check
    if (!interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: 64
      });
    }

    await interaction.deferReply({ flags: 64 });

    // 🔍 Find and delete the reinvites message
    const messages = await interaction.channel.messages.fetch({ limit: 50 });

    // IMPORTANT: Match the updated title (East instead of County)
    const reinvitesMessage = messages.find(m =>
      m.embeds[0]?.title?.includes("Reinvites")
    );

    if (reinvitesMessage) {
      await reinvitesMessage.delete().catch(() => {});
    }

    // 🔵 Build simple "Reinvites Over" embed (no banner)
    const description = `> <:arrowright:1523736161770672209> Reinvites are now over. Please wait patiently for the next round to commence.`;

    const { embed } = embedTemplate({
      title: "<:shines:1524097104547680276> Greenville Roleplay East - *__Reinvites Over__* <:shines:1524097104547680276>",
      description
      // No banner for reinvites over
    });

    // Send announcement
    await interaction.channel.send({
      embeds: [embed]
    });

    await interaction.editReply({
      content: "Reinvites over announcement sent successfully."
    });
  }
};
