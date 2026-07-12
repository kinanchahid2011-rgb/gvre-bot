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
    const prize = interaction.options.getString("prize");
    const winners = interaction.options.getInteger("winners");
    const durationInput = interaction.options.getString("duration");
    const roleRestrictions = interaction.options.getRole("roles")
      ? [interaction.options.getRole("roles").id]
      : [];

    const durationMs = parseDuration(durationInput);
    if (!durationMs) {
      return interaction.reply({
        content:
          "❌ Invalid duration format. Use formats like `10s`, `5m`, `2h`, `3d`, `1mo`, `1y`.",
        flags: 64,
      });
    }

    const endTimestamp = Math.floor((Date.now() + durationMs) / 1000);
    const channel = interaction.channel;

    // Create giveaway embed
    const { embed, files } = embedTemplate({
      title:
        "<a:startilt:1524621292790222989> GVRE Giveaway <a:startilt:1524621292790222989>",
      description:
        `> <:gvreasterisk:1524624524849582101> **Prize:** ${prize}\n` +
        `> <:gvreasterisk:1524624524849582101> **Winners:** ${winners}\n` +
        `> <:gvreasterisk:1524624524849582101> **Ends:** <t:${endTimestamp}:R> (<t:${endTimestamp}:F>)\n` +
        (roleRestrictions.length
          ? `> <:arrowright:1523736161770672209> **Role Restrictions:** ${roleRestrictions.map((r) => `<@&${r}>`).join(", ")}`
          : "") +
        `\n\n> React with <a:startilt:1524621292790222989> to enter!`,
      banner: path.join(__dirname, "../../graphics/gvregiveaway.png"),
      thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
      color: 0x3cf65b,
    });

    // Send giveaway message
    const msg = await channel.send({
      content: "@everyone",
      embeds: [embed],
      files,
    });

    // React with the custom emoji ID
    const emojiId = "1524621292790222989";
    await msg.react(emojiId);

    // Save giveaway data for handler
    await saveGiveaway({
      messageId: msg.id,
      channelId: channel.id,
      guildId: interaction.guild.id,
      prize,
      winners,
      endTime: endTimestamp,
      roleRestrictions,
      emoji: emojiId, // ⭐ FIXED — must match reaction
    });

    await interaction.reply({
      content: `✅ Giveaway started for **${prize}**! Ends <t:${endTimestamp}:R>.`,
      flags: 64,
    });
  },
};
