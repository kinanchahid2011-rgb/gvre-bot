const { SlashCommandBuilder } = require("discord.js");
const path = require("node:path");
const embedTemplate = require("../../utils/embedTemplate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Send the session setup embed"),

  async execute(interaction) {
    const staffRoleId = "1481953107448692860"; // Staff role ID

    // Permission check
    if (!interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: 64
      });
    }

    await interaction.deferReply({ flags: 64 });

    // Find latest startup embed (flexible match)
    const messages = await interaction.channel.messages.fetch({ limit: 50 });
    const startupMessage = messages.find(m =>
      m.embeds[0]?.title?.includes("Session Startup")
    );

    // Build setup embed using template
    const { embed, files } = embedTemplate({
      title: "<a:loadingnine:1524621545861812335> Greenville Roleplay East - *__Session Setup__* <a:loadingnine:1524621545861812335>",
      description:
        `> <:arrowright:1523736161770672209> The reaction goal has been reached! The host is now setting up the session. Please be patient. Thank you for your cooperation!`,
    });

    // Reply to startup embed if found
    if (startupMessage) {
      await startupMessage.reply({ embeds: [embed], files });
    } else {
      await interaction.channel.send({ embeds: [embed], files });
    }

    await interaction.editReply({ content: "Setup embed sent successfully." });
  }
};
