const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { loadGiveaways } = require("../../giveaway/giveawayutils");
const embedTemplate = require("../../utils/embedTemplate");
const path = require("node:path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reroll")
    .setDescription("Reroll a giveaway by message ID (HR only).")
    .addStringOption(option =>
      option
        .setName("messageid")
        .setDescription("The message ID of the giveaway to reroll.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const hrRoleId = "1481953102654607451";

    // Prevent Unknown Interaction
    await interaction.deferReply({ flags: 64 });

    if (!interaction.member.roles.cache.has(hrRoleId)) {
      return interaction.editReply("❌ Only HR can reroll giveaways.");
    }

    const messageId = interaction.options.getString("messageid");
    const giveaways = loadGiveaways();
    const giveaway = giveaways.find(g => g.messageId === messageId);

    if (!giveaway) {
      return interaction.editReply("❌ Giveaway not found.");
    }

    try {
      const guild = interaction.guild;
      const channel = guild.channels.cache.get(giveaway.channelId);

      if (!channel) {
        return interaction.editReply("❌ Giveaway channel no longer exists.");
      }

      const giveawayMessage = await channel.messages.fetch(giveaway.messageId).catch(() => null);
      if (!giveawayMessage) {
        return interaction.editReply("❌ Giveaway message not found.");
      }

      // Ensure reactions are cached
      await giveawayMessage.fetch();
      await giveawayMessage.reactions.resolve(giveaway.emoji)?.fetch();

      const reaction = giveawayMessage.reactions.cache.get(giveaway.emoji);
      if (!reaction) {
        return interaction.editReply("❌ No reaction data found.");
      }

      const users = await reaction.users.fetch();
      let entrants = users.filter(u => !u.bot);

      // Apply role restrictions
      if (giveaway.roleRestrictions.length > 0) {
        entrants = entrants.filter(u => {
          const member = guild.members.cache.get(u.id);
          if (!member) return false;
          return giveaway.roleRestrictions.every(roleId =>
            member.roles.cache.has(roleId)
          );
        });
      }

      const entrantArray = Array.from(entrants.values());
      const winners = [];

      // Pick winners
      if (entrantArray.length > 0) {
        for (let i = 0; i < giveaway.winners; i++) {
          if (entrantArray.length === 0) break;
          const index = Math.floor(Math.random() * entrantArray.length);
          winners.push(entrantArray[index]);
          entrantArray.splice(index, 1);
        }
      }

      // Build reroll embed
      const { embed, files } = embedTemplate({
        title: "<a:startilt:1524621292790222989> Giveaway Rerolled <a:startilt:1524621292790222989>",
        description:
          `> <:gvreasterisk:1524624524849582101> **Prize:** ${giveaway.prize}\n` +
          `> <:gvreasterisk:1524624524849582101> **New Winners:** ${
            winners.length > 0
              ? winners.map(w => `<@${w.id}>`).join(", ")
              : "No valid entrants"
          }\n\n` +
          `> <:gvreasterisk:1524624524849582101> Giveaway has been rerolled by HR.`,
        banner: path.join(__dirname, "../../graphics/gvregiveaway.png"),
        color: 0x3cf65b,
      });

      // Public reroll announcement
      await channel.send({
        content: winners.length > 0 ? winners.map(w => `<@${w.id}>`).join(" ") : "",
        embeds: [embed],
        files,
      });

      // Ephemeral success
      await interaction.editReply("🔄 Giveaway rerolled successfully.");

    } catch (err) {
      console.error("Reroll error:", err);
      return interaction.editReply("❌ An error occurred while rerolling.");
    }
  },
};
