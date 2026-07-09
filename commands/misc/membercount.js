const { SlashCommandBuilder } = require("discord.js");
const embedTemplate = require("../../utils/embedTemplate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Shows the current member count of GVRE."),

  async execute(interaction) {
    const allowedRoleId = "1481952912195190997"; // role allowed to use command

    // Permission check
    if (!interaction.member.roles.cache.has(allowedRoleId)) {
      const { embed, files } = embedTemplate({
        title: "<:shines:1524097104547680276> Access Denied <:shines:1524097104547680276>",
        description:
          "> <:arrowright:1523736161770672209> You don’t have permission to use this command."
      });

      return interaction.reply({
        embeds: [embed],
        files
      });
    }

    // Get guild + member count
    const guild = interaction.guild;
    const memberCount = guild.memberCount;

    const { embed, files } = embedTemplate({
      title: "<:shines:1524097104547680276> Members <:shines:1524097104547680276>",
      description:
        `> <:arrowright:1523736161770672209> **${memberCount.toLocaleString()}** members currently in **${guild.name}**.`
    });

    await interaction.reply({
      embeds: [embed],
      files
    });
  }
};
