const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const path = require("node:path");
const embedTemplate = require("../../utils/embedTemplate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("earlyaccess")
    .setDescription("Send the early access embed")
    .addStringOption(option =>
      option
        .setName("link")
        .setDescription("Early access session link")
        .setRequired(true)
    ),

  async execute(interaction) {
    const staffRoleId = "1481953107448692860"; // Staff role

    // Permission check
    if (!interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: 64,
      });
    }

    let link = interaction.options.getString("link");

    // Auto-add https:// if missing
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      link = `https://${link}`;
    }

    const host = interaction.user;

    await interaction.deferReply({ flags: 64 });

    const description =
      `> <:arrowright:1523736161770672209> ${host} has opened **Early Access** for their session.\n` +
      `> <:arrowright:1523736161770672209> Early access members may now join using the button below.\n\n` +
      `> <:gvreasterisk:1524624524849582101> Please wait for the public release announcement.`;

    const { embed, files } = embedTemplate({
      title:
        "<a:excitedfastforward:1524620959787515975> Greenville Roleplay East - *__Early Access__* <a:excitedfastforward:1524620959787515975>",
      description,
      banner: path.join(__dirname, "../../graphics/gvreea.png"),
    });

    // ✅ Green button that reveals the link privately
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("earlyaccess_link")
        .setLabel("Get Early Access Link")
        .setStyle(ButtonStyle.Success)
    );

    // Send embed with button
    const sent = await interaction.channel.send({
      content: "<@&1481955222183084045>", // Early access ping
      embeds: [embed],
      files,
      components: [row],
      allowedMentions: { parse: ["roles"] },
    });

    // Store the link on the message for later use
    sent.sessionLink = link;

    await interaction.editReply({
      content: "Early Access embed sent successfully.",
    });
  },
};
