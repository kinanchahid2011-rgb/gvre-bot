const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cohost")
    .setDescription("Announce that you are adding a co-host to the session"),

  async execute(interaction) {
    const staffRoleId = "1481953107448692860"; // Staff role
    if (!interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({ content: "You do not have permission to use this command.", flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    const host = interaction.user;

    const description =
      `> <:arrowright:1523736161770672209> ${host} is now co-hosting the session.\n\n` +
      `> <:arrowright:1523736161770672209> Please cooperate with them during the session.`;

    const { embed } = embedTemplate({
      title: "<:shines:1524097104547680276> Greenville Roleplay East - *__Co-host__* <:shines:1524097104547680276>",
      description
    });

    await interaction.channel.send({ embeds: [embed] });
    await interaction.editReply({ content: "Co-host announcement sent successfully." });
  }
};
