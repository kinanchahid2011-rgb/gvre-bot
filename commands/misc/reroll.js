const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
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
    if (!interaction.member.roles.cache.has(hrRoleId)) {
      return interaction.reply({
        content: "❌ Only HR can reroll giveaways.",
        ephemeral: true,
      });
    }

    const messageId = interaction.options.getString("messageid");
    const giveaways = loadGiveaways();
    const giveaway = giveaways.find(g => g.messageId === messageId);

    if (!giveaway) {
      return interaction.reply({
        content: "❌ Giveaway not found.",
        ephemeral: true,
      });
    }

    try {
      const guild = interaction.guild;
      const channel = guild.channels.cache.get(giveaway.channelId);
      const giveawayMessage = await channel.messages.fetch(giveaway.messageId).catch(() => null);

      if (!giveawayMessage) {
        return interaction.reply({
          content: "❌ Giveaway message not found.",
          ephemeral: true,
        });
      }

      await giveawayMessage.fetch(); // ensures reactions are cached
      const reaction = giveawayMessage.reactions.cache.get(giveaway.emoji);
      if (!reaction) {
        return interaction.reply({
          content: "❌ No reaction data found.",
          ephemeral: true,
        });
      }

      const users = await reaction.users.fetch();
      let entrants = users.filter(u => !u.bot);

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

      if (entrantArray.length > 0) {
        for (let i = 0; i < giveaway.winners; i++) {
          if (entrantArray.length === 0) break;
          const index = Math.floor(Math.random() * entrantArray.length);
          winners.push(entrantArray[index]);
          entrantArray.splice(index, 1);
        }
      }

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

      await channel.send({
        content: winners.length > 0 ? winners.map(w => `<@${w.id}>`).join(" ") : "",
        embeds: [embed],
        files,
      });

      await interaction.reply({
        content: "🔄 Giveaway rerolled successfully.",
        ephemeral: true,
      });
    } catch (err) {
      console.error("Reroll error:", err);
      return interaction.reply({
        content: "❌ An error occurred while rerolling.",
        ephemeral: true,
      });
    }
  },
};
