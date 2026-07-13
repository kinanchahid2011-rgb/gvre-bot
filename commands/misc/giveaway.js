const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const path = require("node:path");
const embedTemplate = require("../../utils/embedTemplate");
const { parseDuration, saveGiveaway } = require("../../giveaway/giveawayutils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Start a giveaway in the current channel (HR only).")
    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("The prize for the giveaway.")
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Number of winners.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration (e.g. 10s, 5m, 2h, 3d, 1mo, 1y).")
        .setRequired(true),
    )
    .addRoleOption((option) =>
      option
        .setName("roles")
        .setDescription("Role restrictions (optional).")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });

    const prize = interaction.options.getString("prize");
    const winners = interaction.options.getInteger("winners");
    const durationInput = interaction.options.getString("duration");
    const roleRestrictions = interaction.options.getRole("roles")
      ? [interaction.options.getRole("roles").id]
      : [];

    const durationMs = parseDuration(durationInput);
    if (!durationMs) {
      return interaction.editReply({
        content:
          "❌ Invalid duration format. Use formats like `10s`, `5m`, `2h`, `3d`, `1mo`, `1y`.",
        flags: 64,
      });
    }

    const endTimestamp = Math.floor((Date.now() + durationMs) / 1000);
    const channel = interaction.channel;

    /* ---------------------- CLEAN DESCRIPTION BUILDER ---------------------- */

    let desc = "";
    desc += `> <:gvreasterisk:1524624524849582101> **Prize:** ${prize}\n`;
    desc += `> <:gvreasterisk:1524624524849582101> **Winners:** ${winners}\n`;
    desc += `> <:gvreasterisk:1524624524849582101> **Ends:** <t:${endTimestamp}:R> (<t:${endTimestamp}:F>)\n`;

    if (roleRestrictions.length > 0) {
      desc += `> <:gvreasterisk:1524624524849582101> **Role Restrictions:** ${roleRestrictions
        .map((r) => `<@&${r}>`)
        .join(", ")}\n`;
    }

    desc += `\n> React with <a:startilt:1524621292790222989> to enter!`;

    /* ---------------------------------------------------------------------- */

    const { embed, files } = embedTemplate({
      title:
        "<a:startilt:1524621292790222989> GVRE Giveaway <a:startilt:1524621292790222989>",
      description: desc,
      banner: path.join(__dirname, "../../graphics/gvregiveaway.png"),
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    const msg = await channel.send({
      content: "@everyone",
      embeds: [embed],
      files,
    });

    const emojiId = "1524621292790222989";
    await msg.react(emojiId);

    await saveGiveaway({
      messageId: msg.id,
      channelId: channel.id,
      guildId: interaction.guild.id,
      prize,
      winners,
      endTime: endTimestamp,
      roleRestrictions,
      emoji: emojiId,
    });

    await interaction.editReply({
      content: `✅ Giveaway started for **${prize}**! Ends <t:${endTimestamp}:R>.`,
      flags: 64,
    });
  },
};
